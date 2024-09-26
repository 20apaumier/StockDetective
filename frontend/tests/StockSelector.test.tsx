import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import StockSelector from '../src/components/StockSelector';

describe('StockSelector Component', () => {
    test('renders the form with all fields and the submit button', () => {
        render(<StockSelector onSelectStock={jest.fn()} />);

        // Check for input fields and button
        expect(screen.getByLabelText(/Stock Symbol/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /View Chart/i })).toBeInTheDocument();
    });

    test('calls onSelectStock with correct values when form is submitted', () => {
        const mockOnSelectStock = jest.fn();
        render(<StockSelector onSelectStock={mockOnSelectStock} />);

        // Simulate user input
        fireEvent.change(screen.getByLabelText(/Stock Symbol/i), {
            target: { value: 'aapl' },
        });

        // Simulate form submission
        fireEvent.click(screen.getByRole('button', { name: /View Chart/i }));

        // Check if onSelectStock was called with uppercase symbol and undefined dates
        expect(mockOnSelectStock).toHaveBeenCalledWith('AAPL', undefined, undefined);
    });

    //test('handles date selection correctly', () => {
    //    const mockOnSelectStock = jest.fn();
    //    render(<StockSelector onSelectStock={mockOnSelectStock} />);

    //    // Assuming you have methods to select dates in your date picker
    //    // Since testing DatePicker can be complex due to third-party implementations,
    //    // you might need to mock the DatePicker component or test it at a higher level

    //    // For this example, we'll mock the dates
    //    const startDate = new Date('2021-01-01');
    //    const endDate = new Date('2021-12-31');

    //    // Manually set state since testing DatePicker directly is complex
    //    fireEvent.change(screen.getByLabelText(/Stock Symbol/i), {
    //        target: { value: 'goog' },
    //    });

    //    // Simulate form submission
    //    fireEvent.click(screen.getByRole('button', { name: /View Chart/i }));

    //    // Check if onSelectStock was called with correct dates
    //    // Note: Replace this with actual date selection simulation if possible
    //    expect(mockOnSelectStock).toHaveBeenCalledWith('GOOG', undefined, undefined);
    //});
});