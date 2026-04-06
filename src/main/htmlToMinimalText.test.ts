// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import type { HtmlToDocumentAdapter } from './HtmlToDocumentAdapter';
import { documentToMinimalText, htmlToMinimalText } from './htmlToMinimalText';

const domAdapter: HtmlToDocumentAdapter = {
	parse(html: string): Document {
		return new DOMParser().parseFromString(html, 'text/html');
	},
};

describe('htmlToMinimalText', () => {
	it('converts cleaned HTML to minimal text with structure markers', () => {
		const input = `<!doctype html><html><body>
			<h1>Title</h1>
			<p>Intro</p>
			<ul>
				<li>Item 1</li>
				<li>Item 2
					<ul><li>Sub</li></ul>
				</li>
			</ul>
			<table><tr><th>Key</th><td>Value</td></tr></table>
		</body></html>`;

		const expected = `# Title

Intro

- Item 1
- Item 2
- Sub

Key\tValue`;

		expect(htmlToMinimalText(input, domAdapter)).toBe(expected);
		expect(documentToMinimalText(domAdapter.parse(input))).toBe(expected);
	});
});
