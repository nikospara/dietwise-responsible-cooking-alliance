import type { HtmlToDocumentAdapter } from './HtmlToDocumentAdapter';
import { documentToMinimalText } from './htmlToMinimalText';
import { getBodyElement } from './getBodyElement';
import { removeConsentUI } from './removeConsentUI';

export interface CleanOptions {
	allowedTags: Set<string>;
	dropMedia: boolean;
	strictUrls: boolean;
	keepTables: boolean;
	maxDepth: number;
	applyConsentUiHeuristics: boolean;
	outputMinimalText: boolean;
}

export const DEFAULT_ALLOWED_TAGS: ReadonlySet<string> = new Set([
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'p',
	'ul',
	'ol',
	'li',
	'strong',
	'em',
	'b',
	'i',
	'u',
	'sup',
	'sub',
	'br',
	'time',
	'a',
]);

export const TABLE_TAGS = ['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'] as const;

export interface PageCleaningResult {
	output: string;
	html: string;
	textLength: number;
	stats: Record<string, number>;
}

const browserDomAdapter: HtmlToDocumentAdapter = {
	parse(html: string): Document {
		return new DOMParser().parseFromString(html, 'text/html');
	},
};

export function cleanHtmlForLLM(
	html: string,
	options?: Partial<CleanOptions>,
	adapter: HtmlToDocumentAdapter = browserDomAdapter,
): PageCleaningResult {
	const doc = adapter.parse(html);
	return cleanDocumentForLLM(doc, options);
}

export function cleanDocumentForLLM(doc: Document, options?: Partial<CleanOptions>): PageCleaningResult {
	const opts: CleanOptions = {
		allowedTags: new Set(DEFAULT_ALLOWED_TAGS),
		dropMedia: true,
		strictUrls: true,
		keepTables: false,
		maxDepth: 200000,
		applyConsentUiHeuristics: true,
		outputMinimalText: false,
		...options,
	};
	if (opts.keepTables) TABLE_TAGS.forEach((t) => opts.allowedTags.add(t));

	const body = getBodyElement(doc);
	const stats: Record<string, number> = {
		removedNodes: 0,
		unwrappedNodes: 0,
		removedAttrs: 0,
		strippedLinks: 0,
		emptyNodes: 0,
		removedComments: 0,
		removedConsentNodes: 0,
	};

	if (opts.applyConsentUiHeuristics) {
		stats.removedConsentNodes = removeConsentUI(doc);
	}

	(opts.allowedTags as Set<string>).add('html');
	(opts.allowedTags as Set<string>).add('body');

	stats.removedComments += removeComments(body);

	body.querySelectorAll(
		'script, style, noscript, template, iframe, frame, frameset, object, embed, form, input, textarea, select, button, svg, canvas, picture, source, meta, link, header, footer, nav, aside, share, ads, [aria-hidden="true"]',
	).forEach((n) => {
		n.remove();
		stats.removedNodes++;
	});

	if (opts.dropMedia) {
		body.querySelectorAll('img, video, audio, figure').forEach((n) => {
			n.remove();
			stats.removedNodes++;
		});
	} else {
		body.querySelectorAll('video, audio, figure').forEach((n) => {
			if (!opts.allowedTags.has(n.tagName.toLowerCase())) {
				n.remove();
				stats.removedNodes++;
			}
		});
	}

	const unwrapIfNeeded = (el: Element): Node[] | null => {
		const tag = el.tagName.toLowerCase();
		if (el === doc.documentElement || el === body) return null;
		if (opts.allowedTags.has(tag)) return null;
		const parent = el.parentNode;
		if (!parent) return null;
		if (!opts.keepTables) {
			if (tag === 'tr') {
				parent.insertBefore(doc.createTextNode('\n'), el.nextSibling);
			} else if (tag === 'td' || tag === 'th') {
				parent.insertBefore(doc.createTextNode(' '), el.nextSibling);
			}
		}
		const moved: Node[] = [];
		while (el.firstChild) {
			const child = el.firstChild;
			moved.push(child);
			parent.insertBefore(child, el);
		}
		el.remove();
		stats.unwrappedNodes++;
		return moved;
	};

	const queue: Node[] = [body];
	let processed = 0;
	while (queue.length && processed++ < opts.maxDepth) {
		const node = queue.shift()!;
		if (node.nodeType === 1) {
			const el = node as Element;
			const moved = unwrapIfNeeded(el);
			if (moved) {
				for (const child of moved) queue.push(child);
				continue;
			}

			const tag = el.tagName.toLowerCase();
			let keptHref = false;
			let keptSrc = false;

			for (const attr of Array.from(el.attributes)) {
				const name = attr.name.toLowerCase();
				if (tag === 'a' && name === 'href') {
					const safe = sanitizeUrl(attr.value, opts.strictUrls);
					if (safe) {
						el.setAttribute('href', safe);
						keptHref = true;
					} else {
						keptHref = false;
					}
					continue;
				}
				if (tag === 'img' && name === 'src') {
					if (!opts.allowedTags.has('img')) {
						el.remove();
						stats.removedNodes++;
						break;
					}
					const safe = sanitizeUrl(attr.value, opts.strictUrls);
					if (safe) {
						el.setAttribute('src', safe);
						keptSrc = true;
					} else {
						keptSrc = false;
					}
					continue;
				}
				el.removeAttribute(name);
				stats.removedAttrs++;
			}

			if (tag === 'a' && !keptHref) {
				const parent = el.parentNode;
				if (parent) {
					while (el.firstChild) {
						parent.insertBefore(el.firstChild, el);
					}
					el.remove();
					stats.strippedLinks++;
					continue;
				}
			}
			if (tag === 'img') {
				if (!opts.allowedTags.has('img') || !keptSrc) {
					el.remove();
					stats.removedNodes++;
					continue;
				}
			}

			for (const child of Array.from(el.childNodes)) queue.push(child);
		}
	}

	const isMeaningful = (el: Element): boolean => {
		const tag = el.tagName.toLowerCase();
		if (tag === 'br') return true;
		if (tag === 'ul' || tag === 'ol') {
			return el.querySelectorAll('li').length > 0;
		}
		if (tag === 'img') {
			return opts.allowedTags.has('img') && !!el.getAttribute('src');
		}
		const txt = (el.textContent || '').replace(/[\u200B\u200C\u200D]/g, '').trim();
		return txt.length > 0;
	};

	const allEls = collectElements(body, opts.maxDepth);
	for (let i = allEls.length - 1; i >= 0; i--) {
		const el = allEls[i];
		if (!opts.allowedTags.has(el.tagName.toLowerCase())) continue;
		if (!isMeaningful(el)) {
			el.remove();
			stats.emptyNodes++;
		}
	}

	stats.removedComments += removeComments(body);

	if (opts.outputMinimalText) {
		const minimalText = documentToMinimalText(doc);
		return { output: minimalText, html: minimalText, textLength: textLength(minimalText), stats };
	}

	body.querySelectorAll('br').forEach((br) => br.replaceWith(doc.createTextNode('\n')));

	const blockTags = [
		'p',
		'ul',
		'ol',
		'li',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'table',
		'thead',
		'tbody',
		'tr',
		'th',
		'td',
	];
	for (const tag of blockTags) {
		body.querySelectorAll(tag).forEach((el) => {
			if (el.firstChild && el.firstChild.nodeType !== 3) {
				el.insertBefore(doc.createTextNode('\n'), el.firstChild);
			}
			if (el.lastChild && el.lastChild.nodeType !== 3) {
				el.appendChild(doc.createTextNode('\n'));
			}
		});
	}

	let out = body.innerHTML
		.replace(/\n\s*/g, '\n')
		.replace(/[\t\r ]+/g, ' ')
		.replace(/\n{2,}/g, '\n')
		.trim();
	out = out.replace(/\n/g, '<br>');
	out = out.replace(/\s*<br>\s*/g, '<br>');
	out = out
		.replace(/<(ul|ol)>\s*<\/(ul|ol)>/g, '')
		.replace(/<li>\s*<\/li>/g, '')
		.replace(/<p>\s*<\/p>/g, '')
		.replace(/<h[1-6]>\s*<\/h[1-6]>/g, '');
	out = out.replace(/<li>/g, '\n<li>').trim();

	return { output: out, html: out, textLength: textLength(out), stats };
}

function sanitizeUrl(raw: string, strict: boolean): string | null {
	const val = (raw || '').trim();
	try {
		const u = new URL(val, 'https://example.invalid');
		const scheme = u.protocol.replace(':', '');
		const normalized = u.href.replace('https://example.invalid', '');
		if (!strict) return normalized;
		if (scheme === 'http' || scheme === 'https') return normalized;
		if (u.origin === 'https://example.invalid') return normalized;
		return null;
	} catch {
		if (!strict && /^\/?[\w#/?=&.+%-]+$/.test(val)) return val;
		if (/^\/?[\w#/?=&.+%-]+$/.test(val)) return val;
		return null;
	}
}

function textLength(html: string): number {
	return html
		.replace(/<[^>]+>/g, '')
		.replace(/[\s\u200B\u200C\u200D]+/g, ' ')
		.trim().length;
}

function collectElements(root: Element, max: number): Element[] {
	const out: Element[] = [];
	const stack: Element[] = [root];
	let seen = 0;
	while (stack.length && seen++ < max) {
		const el = stack.pop()!;
		out.push(el);
		const children = Array.from(el.children) as Element[];
		for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
	}
	return out;
}

function removeComments(root: Element): number {
	const toRemove: Comment[] = [];
	const stack: Node[] = [root];
	while (stack.length) {
		const node = stack.pop()!;
		const nt = node.nodeType;
		if (nt === 8) {
			toRemove.push(node as Comment);
			continue;
		}
		const children = node.childNodes ? Array.from(node.childNodes as NodeListOf<ChildNode>) : [];
		for (let i = children.length - 1; i >= 0; i--) stack.push(children[i] as unknown as Node);
	}
	for (const c of toRemove) c.parentNode?.removeChild(c);
	return toRemove.length;
}

export const RECIPE_MINIMAL_TAGS = new Set<string>([
	'h1',
	'h2',
	'h3',
	'p',
	'ul',
	'ol',
	'li',
	'a',
	'strong',
	'em',
	'br',
	'time',
]);

export function cleanHtmlMinimal(html: string): PageCleaningResult {
	return cleanHtmlForLLM(html, {
		allowedTags: new Set(RECIPE_MINIMAL_TAGS),
		keepTables: false,
		dropMedia: true,
	});
}
