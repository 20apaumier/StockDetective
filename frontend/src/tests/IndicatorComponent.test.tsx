import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import IndicatorComponent from '../components/IndicatorComponent';
import { createChart } from 'lightweight-charts';

// Automatically mock the lightweight-charts module
jest.mock('lightweight-charts');

const mockSetData = jest.fn();
const mockFitContent = jest.fn();
const mockAddLineSeries = jest.fn().mockReturnValue({
    setData: mockSetData,
});
const mockTimeScale = jest.fn().mockReturnValue({
    fitContent: mockFitContent,
});
const mockRemove = jest.fn();

beforeEach(() => {
    // Reset mock implementations before each test
    (createChart as jest.Mock).mockReturnValue({
        addLineSeries: mockAddLineSeries,
        timeScale: mockTimeScale,
        remove: mockRemove,
    });
});

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

describe('IndicatorComponent', () => {
    test('renders the chart container when data is provided', () => {
        const sampleData = [
            { time: '2023-10-01', value: 100 },
            { time: '2023-10-02', value: 110 },
        ];
        render(<IndicatorComponent data={sampleData} type="MACD" />);

        // Use getByTestId instead of getByRole
        const chartDiv = screen.getByTestId('indicator-chart');
        expect(chartDiv).toBeInTheDocument();
    });

    test('does not render anything when data is empty', () => {
        render(<IndicatorComponent data={[]} type="RSI" />);
        const chartDiv = screen.queryByTestId('indicator-chart');
        expect(chartDiv).toBeNull();
    });

    test('initializes the chart with correct series color based on type', () => {
        const sampleData = [
            { time: '2023-10-01', value: 100 },
            { time: '2023-10-02', value: 110 },
        ];
        render(<IndicatorComponent data={sampleData} type="RSI" />);

        expect(mockAddLineSeries).toHaveBeenCalledWith({
            color: 'green',
            lineWidth: 2,
        });
    });

    test('initializes the chart with default color when type is unrecognized', () => {
        const sampleData = [
            { time: '2023-10-01', value: 100 },
            { time: '2023-10-02', value: 110 },
        ];
        // @ts-expect-error: Testing unrecognized type
        render(<IndicatorComponent data={sampleData} type="UNKNOWN" />);

        expect(mockAddLineSeries).toHaveBeenCalledWith({
            color: 'blue',
            lineWidth: 2,
        });
    });

    test('sets the chart data correctly', () => {
        const sampleData = [
            { time: '2023-10-01', value: 100 },
            { time: '2023-10-02', value: 110 },
        ];
        render(<IndicatorComponent data={sampleData} type="SMA" />);

        expect(mockSetData).toHaveBeenCalledWith(sampleData);
    });

    test('calls fitContent on the time scale', () => {
        const sampleData = [
            { time: '2023-10-01', value: 100 },
            { time: '2023-10-02', value: 110 },
        ];
        render(<IndicatorComponent data={sampleData} type="MACD" />);

        expect(mockTimeScale).toHaveBeenCalled();
        expect(mockFitContent).toHaveBeenCalledTimes(1);
    });

    test('cleans up the chart when component unmounts', () => {
        const sampleData = [
            { time: '2023-10-01', value: 100 },
            { time: '2023-10-02', value: 110 },
        ];
        const { unmount } = render(<IndicatorComponent data={sampleData} type="RSI" />);

        unmount();

        expect(mockRemove).toHaveBeenCalledTimes(1);
    });

    test('updates the chart when data changes', () => {
        const initialData = [
            { time: '2023-10-01', value: 100 },
            { time: '2023-10-02', value: 110 },
        ];
        const updatedData = [
            { time: '2023-10-01', value: 105 },
            { time: '2023-10-02', value: 115 },
            { time: '2023-10-03', value: 120 },
        ];

        const { rerender } = render(<IndicatorComponent data={initialData} type="MACD" />);

        // On re-render with updated data
        rerender(<IndicatorComponent data={updatedData} type="MACD" />);

        // Expect setData to be called again with updated data
        expect(mockSetData).toHaveBeenCalledWith(updatedData);
    });

    test('updates the chart when type changes', () => {
        const sampleData = [
            { time: '2023-10-01', value: 100 },
            { time: '2023-10-02', value: 110 },
        ];

        const { rerender } = render(<IndicatorComponent data={sampleData} type="MACD" />);

        // Change the type to RSI
        rerender(<IndicatorComponent data={sampleData} type="RSI" />);

        // Expect addLineSeries to be called again with the new color
        expect(mockAddLineSeries).toHaveBeenCalledWith({
            color: 'green',
            lineWidth: 2,
        });
    });
});
