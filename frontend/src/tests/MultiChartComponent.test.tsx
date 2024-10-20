// src/tests/MultiChartComponent.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MultiChartComponent from '../components/MultiChartComponent';

// Mock the ChartComponent to avoid rendering actual chart logic
jest.mock('../components/ChartComponent', () => ({
    __esModule: true,
    default: ({ chartId }: { chartId: number }) => (
        <div data-testid={`chart-${chartId}`}>ChartComponent-{chartId}</div>
    ),
}));

describe('MultiChartComponent', () => {
    beforeEach(() => {
        // Clear all mocks before each test to ensure test isolation
        jest.clearAllMocks();
    });

    test('renders the default chart on initial render', () => {
        render(<MultiChartComponent />);
        // Check that the h2 with 'AAPL Chart' is present
        expect(screen.getByRole('heading', { name: 'AAPL Chart' })).toBeInTheDocument();
        // Check that the ChartComponent is present with the correct test ID
        expect(screen.getByTestId('chart-0')).toBeInTheDocument();
        expect(screen.getByTestId('chart-0')).toHaveTextContent('ChartComponent-0');
    });

    test('adds a new chart when a valid stock symbol is entered and "Add Chart" is clicked', () => {
        render(<MultiChartComponent />);

        const input = screen.getByPlaceholderText('Enter Stock Symbol');
        const addButton = screen.getByText('Add Chart');

        // Enter a valid stock symbol
        fireEvent.change(input, { target: { value: 'msft' } });
        expect(input).toHaveValue('MSFT'); // Ensure input is converted to uppercase

        fireEvent.click(addButton);

        // Check that the new chart's heading is present
        expect(screen.getByRole('heading', { name: 'MSFT Chart' })).toBeInTheDocument();
        // Check that the new ChartComponent is present
        expect(screen.getByTestId('chart-1')).toBeInTheDocument();
        expect(screen.getByTestId('chart-1')).toHaveTextContent('ChartComponent-1');
    });

    test('shows an alert when trying to add a chart with an empty stock symbol', () => {
        render(<MultiChartComponent />);

        // Mock window.alert to prevent actual alerts during tests
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });

        const addButton = screen.getByText('Add Chart');

        // Attempt to add a chart with an empty stock symbol
        fireEvent.click(addButton);

        // Expect the alert to be called with the correct message
        expect(alertMock).toHaveBeenCalledWith('Please enter a valid stock symbol');

        // Ensure no new chart is added
        expect(screen.getAllByRole('heading', { name: 'AAPL Chart' }).length).toBe(1);
        expect(screen.queryByTestId('chart-1')).not.toBeInTheDocument();

        alertMock.mockRestore(); // Restore original alert implementation
    });

    test('removes a chart when "Remove Chart" is clicked and more than one chart exists', () => {
        render(<MultiChartComponent />);

        const input = screen.getByPlaceholderText('Enter Stock Symbol');
        const addButton = screen.getByText('Add Chart');

        // Add a new chart first (e.g., GOOGL)
        fireEvent.change(input, { target: { value: 'googl' } });
        fireEvent.click(addButton);

        // Ensure both charts are present
        expect(screen.getByRole('heading', { name: 'AAPL Chart' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'GOOGL Chart' })).toBeInTheDocument();

        // Find all remove buttons (there should be two)
        const removeButtons = screen.getAllByText('Remove Chart');
        expect(removeButtons.length).toBe(2);

        // Click the remove button for the first chart (AAPL)
        fireEvent.click(removeButtons[0]);

        // The first chart should be removed
        expect(screen.queryByRole('heading', { name: 'AAPL Chart' })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'GOOGL Chart' })).toBeInTheDocument();

        // Ensure the corresponding ChartComponent is removed
        expect(screen.queryByTestId('chart-0')).not.toBeInTheDocument();
        expect(screen.getByTestId('chart-1')).toBeInTheDocument();
    });

    test('does not render Remove Chart button when there is only one chart', () => {
        render(<MultiChartComponent />);
        // There is only one chart initially (AAPL)
        expect(screen.queryByText('Remove Chart')).not.toBeInTheDocument();
    });

    test('allows adding multiple charts with the same stock symbol', () => {
        render(<MultiChartComponent />);

        const input = screen.getByPlaceholderText('Enter Stock Symbol');
        const addButton = screen.getByText('Add Chart');

        // Add 'AAPL' again
        fireEvent.change(input, { target: { value: 'aapl' } });
        fireEvent.click(addButton);

        // Now, there should be two 'AAPL Chart' headings
        const aaplHeadings = screen.getAllByRole('heading', { name: 'AAPL Chart' });
        expect(aaplHeadings.length).toBe(2);

        // And two ChartComponents for 'AAPL'
        expect(screen.getByTestId('chart-0')).toBeInTheDocument();
        expect(screen.getByTestId('chart-1')).toBeInTheDocument();
        expect(screen.getByTestId('chart-0')).toHaveTextContent('ChartComponent-0');
        expect(screen.getByTestId('chart-1')).toHaveTextContent('ChartComponent-1');
    });

    test('handles multiple add and remove operations correctly', () => {
        render(<MultiChartComponent />);

        const input = screen.getByPlaceholderText('Enter Stock Symbol');
        const addButton = screen.getByText('Add Chart');

        // Add multiple charts
        fireEvent.change(input, { target: { value: 'tsla' } });
        fireEvent.click(addButton);

        fireEvent.change(input, { target: { value: 'amzn' } });
        fireEvent.click(addButton);

        // Check that all charts are present
        expect(screen.getByRole('heading', { name: 'AAPL Chart' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'TSLA Chart' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'AMZN Chart' })).toBeInTheDocument();

        expect(screen.getByTestId('chart-0')).toBeInTheDocument();
        expect(screen.getByTestId('chart-1')).toBeInTheDocument();
        expect(screen.getByTestId('chart-2')).toBeInTheDocument();

        // Remove the second chart ('TSLA')
        const removeButtons = screen.getAllByText('Remove Chart');
        fireEvent.click(removeButtons[1]); // Assuming the order is AAPL, TSLA, AMZN

        // TSLA should be removed
        expect(screen.getByRole('heading', { name: 'AAPL Chart' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'TSLA Chart' })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'AMZN Chart' })).toBeInTheDocument();

        // Check that the corresponding ChartComponent is removed
        expect(screen.queryByTestId('chart-1')).not.toBeInTheDocument(); // TSLA was chart-1
        expect(screen.getByTestId('chart-0')).toBeInTheDocument(); // AAPL remains
        expect(screen.getByTestId('chart-2')).toBeInTheDocument(); // AMZN remains
    });
});
