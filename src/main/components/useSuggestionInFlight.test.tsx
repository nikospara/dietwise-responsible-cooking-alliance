import { fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { describe, expect, it } from 'vitest';
import { useSuggestionInFlight } from './useSuggestionInFlight';

interface HookHarnessProps {
	suggestionKey: string;
}

const HookHarness: React.FC<HookHarnessProps> = ({ suggestionKey }) => {
	const { isSuggestionInFlight, setSuggestionInFlight } = useSuggestionInFlight();

	return (
		<div>
			<div data-testid="in-flight">{String(isSuggestionInFlight(suggestionKey))}</div>
			<button onClick={() => setSuggestionInFlight(suggestionKey, true)}>lock</button>
			<button onClick={() => setSuggestionInFlight(suggestionKey, false)}>unlock</button>
		</div>
	);
};

describe('useSuggestionInFlight', () => {
	it('marks and clears a suggestion as in flight', () => {
		render(
			<JotaiProvider>
				<HookHarness suggestionKey="s-1" />
			</JotaiProvider>,
		);

		expect(screen.getByTestId('in-flight').textContent).toBe('false');

		fireEvent.click(screen.getByRole('button', { name: 'lock' }));
		expect(screen.getByTestId('in-flight').textContent).toBe('true');

		fireEvent.click(screen.getByRole('button', { name: 'unlock' }));
		expect(screen.getByTestId('in-flight').textContent).toBe('false');
	});

	it('keeps the lock across remounts when the same jotai store is reused', () => {
		const store = createStore();
		const { unmount } = render(
			<JotaiProvider store={store}>
				<HookHarness suggestionKey="s-1" />
			</JotaiProvider>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'lock' }));
		expect(screen.getByTestId('in-flight').textContent).toBe('true');

		unmount();

		render(
			<JotaiProvider store={store}>
				<HookHarness suggestionKey="s-1" />
			</JotaiProvider>,
		);

		expect(screen.getByTestId('in-flight').textContent).toBe('true');
	});

	it('isolates locks per suggestion key', () => {
		render(
			<JotaiProvider>
				<>
					<HookHarness suggestionKey="s-1" />
					<HookHarness suggestionKey="s-2" />
				</>
			</JotaiProvider>,
		);

		const statuses = screen.getAllByTestId('in-flight');
		expect(statuses[0].textContent).toBe('false');
		expect(statuses[1].textContent).toBe('false');

		fireEvent.click(screen.getAllByRole('button', { name: 'lock' })[0]);

		expect(statuses[0].textContent).toBe('true');
		expect(statuses[1].textContent).toBe('false');
	});
});
