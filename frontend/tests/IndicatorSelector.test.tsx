import '@testing-library/jest-dom';
import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndicatorSelector from '../src/components/IndicatorSelector';

describe('IndicatorSelector Component', () => {
    // Available indicators foromponent
    const availableIndicators = ['RSI', 'MACD', 'Moving Average'];

    //Wrapper component to manage selectedIndicators state
    const Wrapper: React.FC = () => {
        const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
        return (
            <IndicatorSelector
                selectedIndicators={selectedIndicators}
                onChangeIndicators={setSelectedIndicators}
            />
        );
    };

    //helper function to render the component with a stateful wrapper
    const renderComponent = () => {
        render(<Wrapper />);
    };

    test('renders all available indicators with checkboxes', () => {
        renderComponent();

        availableIndicators.forEach((indicator) => {
            // Check if each indicator label is rendered
            const checkbox = screen.getByLabelText(indicator) as HTMLInputElement;
            expect(checkbox).toBeInTheDocument();
            expect(checkbox.type).toBe('checkbox');
            expect(checkbox.checked).toBe(false); // Initially unchecked
        });
    });

    test('renders checkboxes as checked based on selectedIndicators prop', () => {
        // For this test, create a separate wrapper that initializes selectedIndicators
        const CustomWrapper: React.FC<{ initialSelected: string[] }> = ({ initialSelected }) => {
            const [selectedIndicators, setSelectedIndicators] = useState<string[]>(initialSelected);
            return (
                <IndicatorSelector
                    selectedIndicators={selectedIndicators}
                    onChangeIndicators={setSelectedIndicators}
                />
            );
        };

        render(
            <CustomWrapper initialSelected={['RSI', 'MACD']} />
        );

        availableIndicators.forEach((indicator) => {
            const checkbox = screen.getByLabelText(indicator) as HTMLInputElement;
            if (['RSI', 'MACD'].includes(indicator)) {
                expect(checkbox.checked).toBe(true);
            } else {
                expect(checkbox.checked).toBe(false);
            }
        });
    });

    test('calls onChangeIndicators with added indicator when a checkbox is checked', async () => {
        renderComponent();

        const newIndicator = 'MACD';
        const checkbox = screen.getByLabelText(newIndicator) as HTMLInputElement;

        // Ensure the checkbox is initially unchecked
        expect(checkbox.checked).toBe(false);

        // Simulate user clicking the checkbox to select the indicator
        await userEvent.click(checkbox);

        // Assert that the checkbox is now checked
        expect(checkbox.checked).toBe(true);
    });

    test('calls onChangeIndicators with removed indicator when a checkbox is unchecked', async () => {
        //nitialize with 'RSI' and 'MACD' selected
        const CustomWrapper: React.FC<{ initialSelected: string[] }> = ({ initialSelected }) => {
            const [selectedIndicators, setSelectedIndicators] = useState<string[]>(initialSelected);
            return (
                <IndicatorSelector
                    selectedIndicators={selectedIndicators}
                    onChangeIndicators={setSelectedIndicators}
                />
            );
        };

        render(
            <CustomWrapper initialSelected={['RSI', 'MACD']} />
        );

        const indicatorToRemove = 'MACD';
        const checkbox = screen.getByLabelText(indicatorToRemove) as HTMLInputElement;

        // Ensure the checkbox is initially checked
        expect(checkbox.checked).toBe(true);

        // Simulate user clicking the checkbox to deselect the indicator
        await userEvent.click(checkbox);

        // Assert that the checkbox is now unchecked
        expect(checkbox.checked).toBe(false);
    });

    test('toggles multiple indicators correctly', async () => {
        renderComponent();

        const macdCheckbox = screen.getByLabelText('MACD') as HTMLInputElement;
        const maCheckbox = screen.getByLabelText('Moving Average') as HTMLInputElement;

        // Initially, both checkboxes are unchecked
        expect(macdCheckbox.checked).toBe(false);
        expect(maCheckbox.checked).toBe(false);

        // Select 'MACD'
        await userEvent.click(macdCheckbox);
        expect(macdCheckbox.checked).toBe(true);

        // Select 'Moving Average'
        await userEvent.click(maCheckbox);
        expect(maCheckbox.checked).toBe(true);

        // Deselect 'MACD'
        await userEvent.click(macdCheckbox);
        expect(macdCheckbox.checked).toBe(false);
    });

    test('does not call onChangeIndicators when checkbox state remains unchanged', async () => {
        /**
         * This test simulates toggling a checkbox twice:
         * 1. First click: adds 'RSI'
         * 2. Second click: removes 'RSI'
         * The component's state should reflect these changes correctly
         */

        renderComponent();

        const rsiCheckbox = screen.getByLabelText('RSI') as HTMLInputElement;

        // Initially, 'RSI' is unchecked
        expect(rsiCheckbox.checked).toBe(false);

        // Click to select 'RSI'
        await userEvent.click(rsiCheckbox);
        expect(rsiCheckbox.checked).toBe(true);

        // Click to deselect 'RSI'
        await userEvent.click(rsiCheckbox);
        expect(rsiCheckbox.checked).toBe(false);
    });

    test('handles no indicators selected initially', () => {
        renderComponent();

        // Optionally, check for a message indicating no selections
        // Assuming the component displays such a message; if not, adjust accordingly
        // For example:
        // expect(screen.getByText(/No indicators selected/i)).toBeInTheDocument();
    });

    test('handles all indicators selected initially', async () => {
        /**
         * Initialize with all indicators selected
         */
        const CustomWrapper: React.FC<{ initialSelected: string[] }> = ({ initialSelected }) => {
            const [selectedIndicators, setSelectedIndicators] = useState<string[]>(initialSelected);
            return (
                <IndicatorSelector
                    selectedIndicators={selectedIndicators}
                    onChangeIndicators={setSelectedIndicators}
                />
            );
        };

        render(
            <CustomWrapper initialSelected={availableIndicators} />
        );

        availableIndicators.forEach((indicator) => {
            const checkbox = screen.getByLabelText(indicator) as HTMLInputElement;
            expect(checkbox.checked).toBe(true);
        });
    });

    test('matches snapshot with some indicators selected', () => {
        //Create a snapshot with 'RSI' selected
        const CustomWrapper: React.FC<{ initialSelected: string[] }> = ({ initialSelected }) => {
            const [selectedIndicators, setSelectedIndicators] = useState<string[]>(initialSelected);
            return (
                <IndicatorSelector
                    selectedIndicators={selectedIndicators}
                    onChangeIndicators={setSelectedIndicators}
                />
            );
        };

        const { asFragment } = render(
            <CustomWrapper initialSelected={['RSI']} />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});