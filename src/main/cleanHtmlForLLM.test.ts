// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { cleanHtmlForLLM, DEFAULT_ALLOWED_TAGS } from './cleanHtmlForLLM';

function normalizeForAssert(html: string): string {
	return html
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, ' ')
		.replace(/[\u200B\u200C\u200D]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function hasTag(html: string, tag: string): boolean {
	const doc = new DOMParser().parseFromString(`<wrapper>${html}</wrapper>`, 'text/html');
	return doc.querySelector(tag) !== null;
}

function getHref(html: string): string | null {
	const m = html.match(/<a[^>]*href="([^"]+)"[^>]*>/i);
	return m ? m[1] : null;
}

function wrapInHtml(body: string): string {
	return `<!doctype html><html><head></head><body>${body}</body></html>`;
}

describe('cleanHtmlForLLM', () => {
	it('does not unwrap <body> and returns non-empty for simple content', () => {
		const input = '<html><body><p>Hello</p></body></html>';
		const { output, textLength } = cleanHtmlForLLM(input);
		expect(textLength).toBeGreaterThan(0);
		expect(output).toBe('<p>Hello</p>');
	});

	it('strips comments', () => {
		const input = '<html><body><p><!-- I am a comment -->Hello</p></body></html>';
		const { output, textLength } = cleanHtmlForLLM(input);
		expect(textLength).toBeGreaterThan(0);
		expect(output).toBe('<p>Hello</p>');
	});

	it('strips all attributes except <a href>', () => {
		const input = wrapInHtml(`
			<div id="wrap" class="c">
				<p style="color:red">Hello <a href="https://example.com/a.html" onclick="x()" target="_blank">world</a></p>
				<p><span class="x">Total Fat</span></p>
			</div>`);
		const { output } = cleanHtmlForLLM(input);
		expect(hasTag(output, 'p')).toBe(true);
		expect(hasTag(output, 'a')).toBe(true);
		expect(getHref(output)).toBe('https://example.com/a.html');
		expect(/onclick=/.test(output)).toBe(false);
		expect(/style=/.test(output)).toBe(false);
		expect(/class=|id=/.test(output)).toBe(false);
	});

	it('unsafe links are unwrapped; text remains', () => {
		const input = wrapInHtml('<p>Click <a href="javascript:alert(1)">here</a> now.</p>');
		const { output } = cleanHtmlForLLM(input);
		expect(hasTag(output, 'a')).toBe(false);
		expect(normalizeForAssert(output)).toBe('Click here now.');
	});

	it('relative http(s) links are preserved', () => {
		const input = wrapInHtml('<p>See <a href="/path?q=1#frag">link</a></p>');
		const { output } = cleanHtmlForLLM(input);
		expect(getHref(output)).toBe('/path?q=1#frag');
	});

	it('unwraps non-whitelisted wrappers and keeps children', () => {
		const input = wrapInHtml('<div><div><p>Some text</p></div></div>');
		const { output } = cleanHtmlForLLM(input);
		expect(hasTag(output, 'p')).toBe(true);
		expect(/<div/.test(output)).toBe(false);
		expect(normalizeForAssert(output)).toBe('Some text');
	});

	it('removes empty elements', () => {
		const input = wrapInHtml('<section><h2> </h2><p></p><ul><li> </li><li>Item</li></ul></section>');
		const { output } = cleanHtmlForLLM(input);
		expect(output.match(/<li>/g)?.length).toBe(1);
		expect(normalizeForAssert(output)).toBe('Item');
	});

	it('collapses whitespace and preserves line intent via <br>', () => {
		const input = wrapInHtml('<p>Line   one</p>\n<p>\n\nLine\t\n two </p>');
		const { output } = cleanHtmlForLLM(input);
		expect(normalizeForAssert(output)).toBe('Line one Line two');
		expect(output.includes('<br>')).toBe(true);
	});

	it('tables: dropped by default, preserved when keepTables=true', () => {
		const table = wrapInHtml(
			'<table><thead><tr><th>Nutrient</th><th>Value</th></tr></thead><tbody><tr><td>Calories</td><td>100</td></tr></tbody></table>',
		);
		const { output: defHtml } = cleanHtmlForLLM(table);
		expect(/<table|<thead|<tbody|<tr|<th|<td/i.test(defHtml)).toBe(false);
		expect(normalizeForAssert(defHtml)).toBe('Nutrient Value Calories 100');

		const { output: keptHtml } = cleanHtmlForLLM(table, { keepTables: true });
		expect(/<table/i.test(keptHtml)).toBe(true);
		expect(/<td/i.test(keptHtml)).toBe(true);
	});

	it('media: removed by default; kept only when explicitly allowed', () => {
		const input = wrapInHtml('<div><p>Intro</p><img src="img.jpg" alt="x"></div>');
		const { output: defHtml } = cleanHtmlForLLM(input);
		expect(/<img/i.test(defHtml)).toBe(false);

		const allowed = new Set(DEFAULT_ALLOWED_TAGS);
		(allowed as Set<string>).add('img');
		const { output: imgKept } = cleanHtmlForLLM(input, {
			dropMedia: false,
			allowedTags: allowed,
		});
		expect(imgKept).toBe('<p>Intro</p><img src="/img.jpg">');
	});

	it('textLength approximates visible text length', () => {
		const input = wrapInHtml('<h1>Title</h1><p>Alpha <strong>beta</strong> gamma.</p>');
		const { output, textLength } = cleanHtmlForLLM(input);
		expect(textLength).approximately(normalizeForAssert(output).length, textLength * 0.1);
	});

	it('stats reflect removals, unwrappings, and consent cleanup', () => {
		const input = wrapInHtml(`
			<div class="wrap">
				<script>var x=1</script>
				<style>.x{}</style>
				<div id="onetrust-banner-sdk">Cookie consent</div>
				<p id="p">Hello</p>
			</div>`);
		const { stats, output } = cleanHtmlForLLM(input);
		expect(stats.removedNodes).toBeGreaterThanOrEqual(2);
		expect(stats.unwrappedNodes).toBeGreaterThanOrEqual(1);
		expect(stats.removedAttrs).toBeGreaterThanOrEqual(1);
		expect(stats.removedConsentNodes).toBeGreaterThanOrEqual(1);
		expect(normalizeForAssert(output)).toBe('Hello');
	});

	it('handles consent-heavy content', () => {
		const input = wrapInHtml(`
			<div class="overlay">Accept cookies</div>
			<div id="didomi-host">Cookie preferences</div>
			<p>Some real content</p>
			<p>Some more real content.</p>`);
		const { output } = cleanHtmlForLLM(input);
		expect(output).toBe('<p>Some real content</p><br><p>Some more real content.</p>');
	});

	it('supports minimal-text output', () => {
		const input = wrapInHtml(`
			<h1>Title</h1>
			<p>Intro</p>
			<ul><li>Item 1</li><li>Item 2</li></ul>`);
		const { output } = cleanHtmlForLLM(input, { outputMinimalText: true });
		expect(output).toBe('# Title\n\nIntro\n\n- Item 1\n- Item 2');
	});
});
