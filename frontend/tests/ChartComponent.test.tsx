import '@testing-library/jest-dom'; // Import jest-dom for custom matchers
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import ChartComponent from '../src/components/ChartComponent'

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="chart-mock">Chart</div>,
}));

// mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;


describe('ChartComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    test('renders ChartComponent correctly with empty stockSymbol', () => {
        render(<ChartComponent stockSymbol="" />);
        expect(screen.getByText(/Please select a stock to view the chart./i)).toBeInTheDocument();
    });

    test('displays loading message when fetching data', async () => {
        // Mock axios.get to resolve with empty data
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        render(<ChartComponent stockSymbol="AAPL" />);

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

        // Mock axios.get to resolve with mockData
        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        render(<ChartComponent stockSymbol="AAPL" />);

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Assert that the mocked chart is displayed
        expect(screen.getByTestId('chart-mock')).toBeInTheDocument();
    });

    test('displays error message when fetch fails', async () => {
        // Mock axios.get to reject with an error
        mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

        // Mock window.alert
        window.alert = jest.fn();

        render(<ChartComponent stockSymbol="INVALID" />);

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Assert that window.alert was called with the correct message
        expect(window.alert).toHaveBeenCalledWith(
            "Failed to fetch data for symbol 'INVALID'. Please try again."
        );
    });

    test('toggles MACD indicator', async () => {
        const mockData = [
            { date: '2021-01-01', close: 130, macd: 1.5 },
            { date: '2021-01-02', close: 132, macd: 1.7 },
        ];

        // Mock axios.get to resolve with mockData
        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        render(<ChartComponent stockSymbol="AAPL" />);

        // Wait for axios.get to be called and chart to be rendered
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

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
        // Mock axios.get to resolve with empty data
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        render(<ChartComponent stockSymbol="AAPL" />);

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Assert that the appropriate message is displayed
        expect(screen.getByText(/Please select a stock to view the chart./i)).toBeInTheDocument();
    });

    test('calls API with correct parameters', async () => {
        const mockData = [{ date: '2021-01-01', close: 130 }];

        // Mock axios.get to resolve with mockData
        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        const startDate = new Date('2021-01-01');
        const endDate = new Date('2021-01-31');

        render(<ChartComponent stockSymbol="AAPL" startDate={startDate} endDate={endDate} />);

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Assert that axios.get was called with the correct URL and parameters
        expect(mockedAxios.get).toHaveBeenCalledWith('https://localhost:7086/Stock/AAPL', {
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

        // Mock axios.get to resolve with mockData (no MACD, RSI, SMA)
        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        render(<ChartComponent stockSymbol="AAPL" />);

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Get the MACD checkbox and toggle it
        const macdCheckbox = screen.getByLabelText('MACD') as HTMLInputElement;
        fireEvent.click(macdCheckbox);

        // Since mockData lacks MACD data, ensure no errors occur
        expect(macdCheckbox.checked).toBe(true);

        // Optionally, assert that the chart still renders
        expect(screen.getByTestId('chart-mock')).toBeInTheDocument();
    });

    test('renders correctly when optional props are undefined', async () => {
        // Mock axios.get to resolve with empty data
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        render(<ChartComponent stockSymbol="AAPL" />);

        // Assert that the loading message is displayed
        expect(screen.getByText(/Loading chart.../i)).toBeInTheDocument();

        // Wait for axios.get to be called
        await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

        // Since mockData is empty, expect the "Please select a stock..." message
        expect(screen.getByText(/Please select a stock to view the chart./i)).toBeInTheDocument();
    });
});