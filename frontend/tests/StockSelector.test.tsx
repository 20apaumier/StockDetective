import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import StockSelector from '../src/components/StockSelector';

test('renders StockSelector component', () => {
    render(<StockSelector onSelectStock={jest.fn()} />);

    expect(screen.getByLabelText(/Stock Symbol:/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select a start date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select an end date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Chart/i })).toBeInTheDocument();
});

test('updates stock symbol input value on change', () => {
    render(<StockSelector onSelectStock={jest.fn()} />);

    const stockInput = screen.getByLabelText(/Stock Symbol:/i) as HTMLInputElement;

    fireEvent.change(stockInput, { target: { value: 'aapl' } });

    expect(stockInput.value).toBe('aapl');
});

test('calls onSelectStock with correct arguments when form is submitted', () => {
    const mockOnSelectStock = jest.fn();
    render(<StockSelector onSelectStock={mockOnSelectStock} />);

    const stockInput = screen.getByLabelText(/Stock Symbol:/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /View Chart/i });

    fireEvent.change(stockInput, { target: { value: 'aapl' } });
    fireEvent.click(submitButton);

    expect(mockOnSelectStock).toHaveBeenCalledWith('AAPL', undefined, undefined);
});

test('converts stock symbol to uppercase before calling onSelectStock', () => {
    const mockOnSelectStock = jest.fn();
    render(<StockSelector onSelectStock={mockOnSelectStock} />);

    const stockInput = screen.getByLabelText(/Stock Symbol:/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /View Chart/i });

    fireEvent.change(stockInput, { target: { value: 'msft' } });
    fireEvent.click(submitButton);

    expect(mockOnSelectStock).toHaveBeenCalledWith('MSFT', undefined, undefined);
});

test('calls onSelectStock with empty string when stock symbol is empty', () => {
    const mockOnSelectStock = jest.fn();
    render(<StockSelector onSelectStock={mockOnSelectStock} />);

    const submitButton = screen.getByRole('button', { name: /View Chart/i });

    fireEvent.click(submitButton);

    expect(mockOnSelectStock).toHaveBeenCalledWith('', undefined, undefined);
});

test('calls onSelectStock with undefined dates when dates are cleared', () => {
    const mockOnSelectStock = jest.fn();
    render(<StockSelector onSelectStock={mockOnSelectStock} />);

    const stockInput = screen.getByLabelText(/Stock Symbol:/i) as HTMLInputElement;
    const startDateInput = screen.getByPlaceholderText('Select a start date') as HTMLInputElement;
    const endDateInput = screen.getByPlaceholderText('Select an end date') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /View Chart/i });

    fireEvent.change(stockInput, { target: { value: 'goog' } });
    fireEvent.change(startDateInput, { target: { value: '01/01/2021' } });
    fireEvent.change(endDateInput, { target: { value: '01/31/2021' } });

    // Clear dates
    fireEvent.change(startDateInput, { target: { value: '' } });
    fireEvent.change(endDateInput, { target: { value: '' } });

    fireEvent.click(submitButton);

    expect(mockOnSelectStock).toHaveBeenCalledWith('GOOG', undefined, undefined);
});