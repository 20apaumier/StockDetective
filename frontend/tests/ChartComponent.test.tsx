import '@testing-library/jest-dom'; // Import jest-dom for custom matchers
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import ChartComponent from '../src/components/ChartComponent';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
    Line: React.forwardRef((props, ref) => <div data-testid="chart-mock">Chart</div>),
}));

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ChartComponent', () => {
    const mockAddChart = jest.fn();
    const mockRemoveChart = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    test('renders ChartComponent correctly with empty stockSymbol', () => {
        render(
            <ChartComponent
                chartId={1}
                stockSymbol=""
                addChart={mockAddChart}
                removeChart={mockRemoveChart}
            />
        );

        expect(screen.getByText(/No data available for/i)).toBeInTheDocument();
    });

    test('displays loading message when fetching data', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        render(
            <ChartComponent
                chartId={1}
                stockSymbol="AAPL"
                addChart={mockAddChart}
                removeChart={mockRemoveChart}
            />
        );

        // Assert that the loading message is displayed
        expect(screen.getByText(/Loading chart.../i)).toBeInTheDocument();

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));
    });

    test('fetches data and displays chart', async () => {
        const mockData = [
            { date: '2021-01-01', close: 130 },
            { date: '2021-01-02', close: 132 },
        ];

        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        render(
            <ChartComponent
                chartId={1}
                stockSymbol="AAPL"
                addChart={mockAddChart}
                removeChart={mockRemoveChart}
            />
        );

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Wait for the chart to be rendered
        await waitFor(() => expect(screen.getByTestId('chart-mock')).toBeInTheDocument());
    });

    test('displays error message when fetch fails', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

        // Mock window.alert
        window.alert = jest.fn();

        render(
            <ChartComponent
                chartId={1}
                stockSymbol="INVALID"
                addChart={mockAddChart}
                removeChart={mockRemoveChart}
            />
        );

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Wait for alert to be called
        await waitFor(() =>
            expect(window.alert).toHaveBeenCalledWith(
                "Failed to fetch data for symbol 'INVALID'. Please try again."
            )
        );
    });

    test('toggles MACD indicator', async () => {
        const mockData = [
            { date: '2021-01-01', close: 130, macd: 1.5 },
            { date: '2021-01-02', close: 132, macd: 1.7 },
        ];

        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        render(
            <ChartComponent
                chartId={1}
                stockSymbol="AAPL"
                addChart={mockAddChart}
                removeChart={mockRemoveChart}
            />
        );

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Wait for the chart to be rendered
        await waitFor(() => expect(screen.getByTestId('chart-mock')).toBeInTheDocument());

        // Get the MACD checkbox
        const macdCheckbox = screen.getByLabelText('MACD') as HTMLInputElement;

        // Initially, MACD should be unchecked
        expect(macdCheckbox.checked).toBe(false);

        // Click the checkbox to toggle MACD
        fireEvent.click(macdCheckbox);

        // Now, MACD should be checked
        expect(macdCheckbox.checked).toBe(true);
    });

    test('displays message when no data is returned', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        render(
            <ChartComponent
                chartId={1}
                stockSymbol="AAPL"
                addChart={mockAddChart}
                removeChart={mockRemoveChart}
            />
        );

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Wait for the message to appear
        await waitFor(() =>
            expect(screen.getByText(/No data available for AAPL\./i)).toBeInTheDocument()
        );
    });

    test('calls API with correct parameters', async () => {
        const mockData = [{ date: '2021-01-01', close: 130 }];

        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        const startDate = new Date('2021-01-01');
        const endDate = new Date('2021-01-31');

        render(
            <ChartComponent
                chartId={1}
                stockSymbol="AAPL"
                startDate={startDate}
                endDate={endDate}
                addChart={mockAddChart}
                removeChart={mockRemoveChart}
            />
        );

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Assert that axios.get was called with the correct URL and parameters
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:7086/Stock/AAPL', {
            params: {
                from: '2021-01-01',
                to: '2021-01-31',
            },
        });
    });

    test('handles missing indicator data gracefully', async () => {
        const mockData = [
            { date: '2021-01-01', close: 130 },
            { date: '2021-01-02', close: 132 },
        ];

        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        render(
            <ChartComponent
                chartId={1}
                stockSymbol="AAPL"
                addChart={mockAddChart}
                removeChart={mockRemoveChart}
            />
        );

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Wait for the chart to be rendered
        await waitFor(() => expect(screen.getByTestId('chart-mock')).toBeInTheDocument());

        // Get the MACD checkbox and toggle it
        const macdCheckbox = screen.getByLabelText('MACD') as HTMLInputElement;
        fireEvent.click(macdCheckbox);

        // Since mockData lacks MACD data, ensure no errors occur
        expect(macdCheckbox.checked).toBe(true);

        // Optionally, assert that the chart still renders
        expect(screen.getByTestId('chart-mock')).toBeInTheDocument();
    });

    test('renders correctly when optional props are undefined', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        render(
            <ChartComponent
                chartId={1}
                stockSymbol="AAPL"
                addChart={mockAddChart}
                removeChart={mockRemoveChart}
            />
        );

        // Assert that the loading message is displayed
        expect(screen.getByText(/Loading chart.../i)).toBeInTheDocument();

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Since mockData is empty, expect the "No data available..." message
        await waitFor(() =>
            expect(screen.getByText(/No data available for AAPL\./i)).toBeInTheDocument()
        );
    });
});
