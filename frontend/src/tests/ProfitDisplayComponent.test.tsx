// src/tests/ProfitDisplayComponent.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ProfitDisplayComponent from '../components/ProfitDisplayComponent';
import { LineData, StockDataItem } from '../types';
import userEvent from '@testing-library/user-event';
import { formatDate } from '../utils';

// Mock the formatDate function to return the date as is
jest.mock('../utils', () => ({
    formatDate: (date: string) => date,
}));

// Define the TradeParameters interface as in the component
interface TradeParameters {
    [indicator: string]: {
        buyThreshold: number;
        buyCondition: '<' | '>';
        sellThreshold: number;
        sellCondition: '<' | '>';
        tradeAmount: number;
        tradeAmountType: 'shares' | 'dollars';
    };
}

describe('ProfitDisplayComponent', () => {
    // Default mock data
    const defaultIndicatorData: { [indicator: string]: LineData[] } = {
        Price: [
            { time: '2023-10-01', value: 100 },
            { time: '2023-10-02', value: 105 },
            { time: '2023-10-03', value: 102 },
        ],
    };

    const defaultTradeParameters: TradeParameters = {
        Price: {
            buyThreshold: 99,
            buyCondition: '<',
            sellThreshold: 106,
            sellCondition: '>',
            tradeAmount: 10,
            tradeAmountType: 'shares',
        },
    };

    const defaultRawData: StockDataItem[] = [
        { date: '2023-10-01', open: 100, high: 100, low: 98, close: 100, volume: 1000 },
        { date: '2023-10-02', open: 101, high: 106, low: 100, close: 105, volume: 1500 },
        { date: '2023-10-03', open: 104, high: 103, low: 99, close: 102, volume: 1200 },
    ];

    // Helper function to render the component with default or custom props
    const setupComponent = (props = {}) => {
        const defaultProps = {
            indicatorData: defaultIndicatorData,
            tradeParameters: defaultTradeParameters,
            rawData: defaultRawData,
            ...props,
        };
        return render(<ProfitDisplayComponent {...defaultProps} />);
    };

    afterEach(() => {
        cleanup(); // Ensure cleanup after each test
    });

    test('renders Calculate Profit button and Total Profit heading', () => {
        setupComponent();

        // Check for Calculate Profit button
        const calculateButton = screen.getByRole('button', { name: /Calculate Profit/i });
        expect(calculateButton).toBeInTheDocument();

        // Check for Total Profit heading with initial value $0.00
        const profitHeading = screen.getByText(/Total Profit: \$0\.00/i);
        expect(profitHeading).toBeInTheDocument();
    });

    test('calculates profit correctly when no trades occur', async () => {
        // Modify tradeParameters to prevent any trades
        const noTradeParameters: TradeParameters = {
            Price: {
                buyThreshold: 50, // Lower than any indicator value
                buyCondition: '<',
                sellThreshold: 200, // Higher than any indicator value
                sellCondition: '>',
                tradeAmount: 10,
                tradeAmountType: 'shares',
            },
        };

        setupComponent({ tradeParameters: noTradeParameters });

        // Click Calculate Profit button
        const calculateButton = screen.getByRole('button', { name: /Calculate Profit/i });
        fireEvent.click(calculateButton);

        // Wait for the Total Profit to update
        await waitFor(() => {
            const profitHeading = screen.getByText(/Total Profit: \$0\.00/i);
            expect(profitHeading).toBeInTheDocument();
        });
    });

    test('calculates profit correctly when buy and sell conditions are met', async () => {
        // Modify tradeParameters to trigger a buy and a sell
        const modifiedTradeParameters: TradeParameters = {
            Price: {
                buyThreshold: 99, // Buy when Price < 99
                buyCondition: '<',
                sellThreshold: 104, // Sell when Price > 104
                sellCondition: '>',
                tradeAmount: 10, // Buy 10 shares
                tradeAmountType: 'shares',
            },
        };

        const modifiedIndicatorData: { [indicator: string]: LineData[] } = {
            Price: [
                { time: '2023-10-01', value: 98 }, // Buy condition met
                { time: '2023-10-02', value: 105 }, // Sell condition met
                { time: '2023-10-03', value: 102 }, // No condition met
            ],
        };

        const modifiedRawData: StockDataItem[] = [
            { date: '2023-10-01', open: 100, high: 100, low: 98, close: 98, volume: 1000 },
            { date: '2023-10-02', open: 98, high: 107, low: 97, close: 105, volume: 1500 },
            { date: '2023-10-03', open: 104, high: 103, low: 99, close: 102, volume: 1200 },
        ];

        setupComponent({
            tradeParameters: modifiedTradeParameters,
            indicatorData: modifiedIndicatorData,
            rawData: modifiedRawData,
        });

        // Click Calculate Profit button
        const calculateButton = screen.getByRole('button', { name: /Calculate Profit/i });
        fireEvent.click(calculateButton);

        // Wait for the Total Profit to update
        await waitFor(() => {
            // Expected profit: $70.00
            const profitHeading = screen.getByText(/Total Profit: \$70\.00/i);
            expect(profitHeading).toBeInTheDocument();
        });
    });

    test('calculates profit correctly with tradeAmountType "dollars"', async () => {
        // Modify tradeParameters to use 'dollars' instead of 'shares'
        const tradeParametersInDollars: TradeParameters = {
            Price: {
                buyThreshold: 99,
                buyCondition: '<',
                sellThreshold: 106,
                sellCondition: '>',
                tradeAmount: 1000, // $1,000
                tradeAmountType: 'dollars',
            },
        };

        const indicatorDataInDollars: { [indicator: string]: LineData[] } = {
            Price: [
                { time: '2023-10-01', value: 98 }, // Buy condition met
                { time: '2023-10-02', value: 107 }, // Sell condition met
            ],
        };

        const rawDataInDollars: StockDataItem[] = [
            { date: '2023-10-01', open: 100, high: 100, low: 98, close: 98, volume: 1000 },
            { date: '2023-10-02', open: 98, high: 107, low: 97, close: 107, volume: 1500 },
        ];

        setupComponent({
            tradeParameters: tradeParametersInDollars,
            indicatorData: indicatorDataInDollars,
            rawData: rawDataInDollars,
        });

        // Click Calculate Profit button
        const calculateButton = screen.getByRole('button', { name: /Calculate Profit/i });
        fireEvent.click(calculateButton);

        // Wait for the Total Profit to update
        await waitFor(() => {
            // Expected calculation:
            // Initial cash: $10,000
            // 2023-10-01:
            // Buy $1,000 worth of shares at $98 each -> 10.204 shares
            // Cash after buy: $10,000 - $1,000 = $9,000
            // Shares: 10.204
            //
            // 2023-10-02:
            // Sell $1,000 worth of shares at $107 each -> 9.345 shares
            // Cash after sell: $9,000 + $1,000 = $10,000
            // Shares: 10.204 - 9.345 ? 0.859 shares
            //
            // Total Value: $10,000 + 0.859 * $107 ? $10,091.81
            // Profit: $91.81

            // Allow for floating point precision by using a regex that matches the first two decimal places
            const profitHeading = screen.getByText(/Total Profit: \$91\.\d{2}/i);
            expect(profitHeading).toBeInTheDocument();
        });
    });

    test('handles multiple indicators correctly', async () => {
        // Extend indicatorData to include RSI
        const multipleIndicatorData: { [indicator: string]: LineData[] } = {
            Price: [
                { time: '2023-10-01', value: 100 },
                { time: '2023-10-02', value: 105 },
                { time: '2023-10-03', value: 102 },
            ],
            RSI: [
                { time: '2023-10-01', value: 20 },
                { time: '2023-10-02', value: 80 },
                { time: '2023-10-03', value: 50 },
            ],
        };

        const multipleTradeParameters: TradeParameters = {
            Price: {
                buyThreshold: 99,
                buyCondition: '<',
                sellThreshold: 106,
                sellCondition: '>',
                tradeAmount: 10,
                tradeAmountType: 'shares',
            },
            RSI: {
                buyThreshold: 25,
                buyCondition: '<',
                sellThreshold: 75,
                sellCondition: '>',
                tradeAmount: 5,
                tradeAmountType: 'shares',
            },
        };

        const multipleRawData: StockDataItem[] = [
            { date: '2023-10-01', open: 100, high: 100, low: 98, close: 100, volume: 1000 },
            { date: '2023-10-02', open: 101, high: 106, low: 100, close: 105, volume: 1500 },
            { date: '2023-10-03', open: 104, high: 103, low: 99, close: 102, volume: 1200 },
        ];

        setupComponent({
            tradeParameters: multipleTradeParameters,
            indicatorData: multipleIndicatorData,
            rawData: multipleRawData,
        });

        // Click Calculate Profit button
        const calculateButton = screen.getByRole('button', { name: /Calculate Profit/i });
        fireEvent.click(calculateButton);

        // Wait for the Total Profit to update
        await waitFor(() => {
            // Expected calculation:
            // Initial cash: $10,000
            // Shares: 0

            // 2023-10-01:
            // Price: 100 < 99? No
            // RSI: 20 < 25? Yes -> Buy 5 shares at $100 each
            // Cost: 5 * 100 = $500
            // Cash after buy: $10,000 - $500 = $9,500
            // Shares: 5

            // 2023-10-02:
            // Price: 105 > 106? No
            // RSI: 80 > 75? Yes -> Sell 5 shares at $105 each
            // Revenue: 5 * 105 = $525
            // Cash after sell: $9,500 + $525 = $10,025
            // Shares: 0

            // 2023-10-03:
            // Price: 102 > 106? No
            // RSI: 50 > 75? No
            // No trades

            // Total Value: $10,025 + 0 * $102 = $10,025
            // Profit: $10,025 - $10,000 = $25

            const profitHeading = screen.getByText(/Total Profit: \$25\.00/i);
            expect(profitHeading).toBeInTheDocument();
        });
    });

    test('handles empty rawData gracefully', async () => {
        const emptyRawData: StockDataItem[] = [];

        setupComponent({
            rawData: emptyRawData,
        });

        // Click Calculate Profit button
        const calculateButton = screen.getByRole('button', { name: /Calculate Profit/i });
        fireEvent.click(calculateButton);

        // Wait for the Total Profit to update
        await waitFor(() => {
            const profitHeading = screen.getByText(/Total Profit: \$0\.00/i);
            expect(profitHeading).toBeInTheDocument();
        });
    });

    test('handles indicators with no matching dates in rawData', async () => {
        const mismatchedIndicatorData: { [indicator: string]: LineData[] } = {
            Price: [
                { time: '2023-09-30', value: 98 }, // No matching rawData
                { time: '2023-10-02', value: 105 },
            ],
        };

        const mismatchedTradeParameters: TradeParameters = {
            Price: {
                buyThreshold: 99,
                buyCondition: '<',
                sellThreshold: 106,
                sellCondition: '>',
                tradeAmount: 10,
                tradeAmountType: 'shares',
            },
        };

        const mismatchedRawData: StockDataItem[] = [
            { date: '2023-10-02', open: 101, high: 106, low: 100, close: 105, volume: 1500 },
            { date: '2023-10-03', open: 104, high: 103, low: 99, close: 102, volume: 1200 },
        ];

        setupComponent({
            indicatorData: mismatchedIndicatorData,
            tradeParameters: mismatchedTradeParameters,
            rawData: mismatchedRawData,
        });

        // Click Calculate Profit button
        const calculateButton = screen.getByRole('button', { name: /Calculate Profit/i });
        fireEvent.click(calculateButton);

        // Wait for the Total Profit to update
        await waitFor(() => {
            // Calculation steps:

            // Initial cash: $10,000
            // Shares: 0

            // 2023-10-02:
            // Price: 105 > 106? No
            // No trades

            // 2023-10-03:
            // Price: 102 > 106? No
            // No trades

            // Total Value: $10,000
            // Profit: $0

            const profitHeading = screen.getByText(/Total Profit: \$0\.00/i);
            expect(profitHeading).toBeInTheDocument();
        });
    });
});
