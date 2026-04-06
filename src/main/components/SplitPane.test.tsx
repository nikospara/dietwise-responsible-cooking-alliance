import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SplitPane from './SplitPane';

const setResizeObserver = (height: number) => {
	class MockResizeObserver {
		constructor(private callback: ResizeObserverCallback) {}
		observe(target: HTMLElement) {
			this.callback(
				[
					{
						contentRect: { height } as DOMRectReadOnly,
						borderBoxSize: [],
						contentBoxSize: [],
						devicePixelContentBoxSize: [],
						target,
					},
				],
				this as unknown as ResizeObserver,
			);
		}
		disconnect() {}
	}

	vi.stubGlobal('ResizeObserver', MockResizeObserver);
};

describe('SplitPane', () => {
	it('renders nothing when both sections are empty', () => {
		setResizeObserver(400);
		const { container } = render(<SplitPane top={null} bottom={null} />);
		expect(container.firstChild).toBeNull();
	});

	it('renders only the top section when bottom is empty', () => {
		setResizeObserver(400);
		const { container, getByText } = render(<SplitPane top={<div>Top</div>} bottom={null} />);
		expect(getByText('Top')).toBeTruthy();
		expect(container.querySelector('.split-pane__divider')).toBeNull();
	});

	it('initializes the split and animates to the default ratio', () => {
		setResizeObserver(400);
		const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
			cb(0);
			return 1;
		});

		const { container, getByText } = render(<SplitPane top={<div>Top</div>} bottom={<div>Bottom</div>} />);

		expect(getByText('Top')).toBeTruthy();
		expect(getByText('Bottom')).toBeTruthy();

		const topSection = container.querySelector('.split-pane__section--top') as HTMLElement | null;
		const bottomSection = container.querySelector('.split-pane__section--bottom') as HTMLElement | null;
		expect(topSection).toBeTruthy();
		expect(bottomSection).toBeTruthy();
		expect(topSection?.classList.contains('split-pane__section--animated')).toBeTruthy();
		expect(bottomSection?.classList.contains('split-pane__section--animated')).toBeTruthy();
		expect(topSection?.style.flexBasis).toBe('50%');
		expect(bottomSection?.style.flexBasis).toBe('50%');

		raf.mockRestore();
	});
});
