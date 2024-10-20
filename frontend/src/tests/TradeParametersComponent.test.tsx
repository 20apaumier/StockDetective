import React from 'react';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import TradeParametersComponent, { TradeParameters } from '../components/TradeParametersComponent';

describe('TradeParametersComponent', () => {
    afterEach(() => {
        cleanup(); // Clean up the DOM after each test
        jest.clearAllMocks(); // Clear mock function calls
    });

    test('renders the component with all indicators and input fields', async () => {
        render(<TradeParametersComponent onParametersChange={jest.fn()} />);

        // Check for the heading
        expect(screen.getByText(/Trade Parameters/i)).toBeInTheDocument();

        // Check for table headers
        expect(screen.getByText(/Indicator/i)).toBeInTheDocument();
        expect(screen.getByText(/Buy Condition/i)).toBeInTheDocument();
        expect(screen.getByText(/Buy Threshold/i)).toBeInTheDocument();
        expect(screen.getByText(/Sell Condition/i)).toBeInTheDocument();
        expect(screen.getByText(/Sell Threshold/i)).toBeInTheDocument();
        expect(screen.getByText(/Trade Amount/i)).toBeInTheDocument();
        expect(screen.getByText(/Amount Type/i)).toBeInTheDocument();

        // Define the indicators as per the component
        const indicators = ['MACD', 'RSI', 'SMA'];

        // Check for each indicator row
        for (const indicator of indicators) {
            // Find the cell with the indicator name
            const indicatorCell = await screen.findByText(indicator);
            expect(indicatorCell).toBeInTheDocument();

            // Find the closest row to the indicator cell
            const row = indicatorCell.closest('tr');
            expect(row).toBeInTheDocument();

            if (row) {
                const { getByLabelText } = within(row);

                // Buy Condition Select
                const buyConditionSelect = getByLabelText(`${indicator} Buy Condition`);
                expect(buyConditionSelect).toBeInTheDocument();
                expect(buyConditionSelect).toHaveValue('<');

                // Buy Threshold Input
                const buyThresholdInput = getByLabelText(`${indicator} Buy Threshold`) as HTMLInputElement;
                expect(buyThresholdInput).toBeInTheDocument();
                expect(buyThresholdInput).toHaveValue(0);

                // Sell Condition Select
                const sellConditionSelect = getByLabelText(`${indicator} Sell Condition`);
                expect(sellConditionSelect).toBeInTheDocument();
                expect(sellConditionSelect).toHaveValue('>');

                // Sell Threshold Input
                const sellThresholdInput = getByLabelText(`${indicator} Sell Threshold`) as HTMLInputElement;
                expect(sellThresholdInput).toBeInTheDocument();
                expect(sellThresholdInput).toHaveValue(0);

                // Trade Amount Input
                const tradeAmountInput = getByLabelText(`${indicator} Trade Amount`) as HTMLInputElement;
                expect(tradeAmountInput).toBeInTheDocument();
                expect(tradeAmountInput).toHaveValue(0);

                // Trade Amount Type Select
                const tradeAmountTypeSelect = getByLabelText(`${indicator} Trade Amount Type`);
                expect(tradeAmountTypeSelect).toBeInTheDocument();
                expect(tradeAmountTypeSelect).toHaveValue('shares');
            }
        }
    });

    test('initializes all input fields with default values', async () => {
        render(<TradeParametersComponent onParametersChange={jest.fn()} />);

        const indicators = ['MACD', 'RSI', 'SMA'];

        for (const indicator of indicators) {
            const indicatorCell = await screen.findByText(indicator);
            expect(indicatorCell).toBeInTheDocument();

            const row = indicatorCell.closest('tr');
            expect(row).toBeInTheDocument();

            if (row) {
                const { getByLabelText } = within(row);

                // Buy Condition Select
                const buyConditionSelect = getByLabelText(`${indicator} Buy Condition`);
                expect(buyConditionSelect).toHaveValue('<');

                // Buy Threshold Input
                const buyThresholdInput = getByLabelText(`${indicator} Buy Threshold`) as HTMLInputElement;
                expect(buyThresholdInput).toHaveValue(0);

                // Sell Condition Select
                const sellConditionSelect = getByLabelText(`${indicator} Sell Condition`);
                expect(sellConditionSelect).toHaveValue('>');

                // Sell Threshold Input
                const sellThresholdInput = getByLabelText(`${indicator} Sell Threshold`) as HTMLInputElement;
                expect(sellThresholdInput).toHaveValue(0);

                // Trade Amount Input
                const tradeAmountInput = getByLabelText(`${indicator} Trade Amount`) as HTMLInputElement;
                expect(tradeAmountInput).toHaveValue(0);

                // Trade Amount Type Select
                const tradeAmountTypeSelect = getByLabelText(`${indicator} Trade Amount Type`);
                expect(tradeAmountTypeSelect).toHaveValue('shares');
            }
        }
    });

    test('handles onParametersChange not being a function gracefully', async () => {
        // Suppress console.error to avoid cluttering test output
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Render the component without passing onParametersChange
        render(<TradeParametersComponent onParametersChange={undefined as unknown as () => void} />);

        // Check for the heading
        expect(screen.getByText(/Trade Parameters/i)).toBeInTheDocument();

        // Wait for useEffect to run and log the error
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('onParametersChange is not a function');
        });

        // Restore console.error
        consoleErrorSpy.mockRestore();
    });

    test('calls onParametersChange on initial render with default parameters', async () => {
        const mockOnParametersChange = jest.fn();
        render(<TradeParametersComponent onParametersChange={mockOnParametersChange} />);

        // Wait for the initial parameters to be set
        await waitFor(() => {
            expect(mockOnParametersChange).toHaveBeenCalledTimes(1);
        });

        // Assert that it was called with the initial parameters
        const initialParams = mockOnParametersChange.mock.calls[0][0] as TradeParameters;
        expect(initialParams).toMatchObject({
            MACD: {
                buyThreshold: 0,
                buyCondition: '<',
                sellThreshold: 0,
                sellCondition: '>',
                tradeAmount: 0,
                tradeAmountType: 'shares',
            },
            RSI: {
                buyThreshold: 0,
                buyCondition: '<',
                sellThreshold: 0,
                sellCondition: '>',
                tradeAmount: 0,
                tradeAmountType: 'shares',
            },
            SMA: {
                buyThreshold: 0,
                buyCondition: '<',
                sellThreshold: 0,
                sellCondition: '>',
                tradeAmount: 0,
                tradeAmountType: 'shares',
            },
        });

        // Now, check that it's not called again (no additional calls)
        expect(mockOnParametersChange).toHaveBeenCalledTimes(1);
    });
});
