// src/tests/NotificationsComponent.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationsComponent from '../components/NotificationsComponent';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Initialize axios mock adapter
const mock = new MockAdapter(axios);

// Helper function to setup the component
const setup = (stockSymbol: string) => {
    render(<NotificationsComponent stockSymbol={stockSymbol} />);
};

describe('NotificationsComponent', () => {
    afterEach(() => {
        mock.reset();
    });

    test('renders all form fields correctly', () => {
        setup('AAPL');

        // Check for Email input
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();

        // Check for Phone Number input
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();

        // Check for Indicator select
        expect(screen.getByLabelText(/Indicator/i)).toBeInTheDocument();

        // Check for Threshold input
        expect(screen.getByLabelText(/Threshold/i)).toBeInTheDocument();

        // Check for Condition select
        expect(screen.getByLabelText(/Condition/i)).toBeInTheDocument();

        // Check for Submit button
        expect(screen.getByRole('button', { name: /Subscribe/i })).toBeInTheDocument();
    });

    test('displays error when submitting without email and phone number', async () => {
        setup('GOOGL');

        // Fill in other required fields
        fireEvent.change(screen.getByLabelText(/Indicator/i), { target: { value: 'RSI' } });
        fireEvent.change(screen.getByLabelText(/Threshold/i), { target: { value: '70' } });
        fireEvent.change(screen.getByLabelText(/Condition/i), { target: { value: 'Above' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Subscribe/i }));

        // Expect error message
        expect(await screen.findByText(/Please provide either an email or phone number\./i)).toBeInTheDocument();

        // Ensure axios.post was not called
        expect(mock.history.post.length).toBe(0);
    });

    test('submits the form successfully with email', async () => {
        setup('TSLA');

        // Fill in email
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@example.com' } });

        // Fill in other required fields
        fireEvent.change(screen.getByLabelText(/Indicator/i), { target: { value: 'MACD' } });
        fireEvent.change(screen.getByLabelText(/Threshold/i), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText(/Condition/i), { target: { value: 'Above' } });

        // Mock successful POST request
        mock.onPost('http://localhost:7086/notifications').reply(200);

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Subscribe/i }));

        // Expect success message
        expect(await screen.findByText(/Notification successfully created!/i)).toBeInTheDocument();

        // Ensure form fields are reset
        expect(screen.getByLabelText(/Email Address/i)).toHaveValue('');
        expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('');
        expect(screen.getByLabelText(/Indicator/i)).toHaveValue('Price');
        expect(screen.getByLabelText(/Threshold/i)).toHaveValue(null); // Number input reset to empty
        expect(screen.getByLabelText(/Condition/i)).toHaveValue('Above');
    });

    test('submits the form successfully with phone number', async () => {
        setup('AMZN');

        // Fill in phone number
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '1234567890' } });

        // Fill in other required fields
        fireEvent.change(screen.getByLabelText(/Indicator/i), { target: { value: 'SMA' } });
        fireEvent.change(screen.getByLabelText(/Threshold/i), { target: { value: '50' } });
        fireEvent.change(screen.getByLabelText(/Condition/i), { target: { value: 'Below' } });

        // Mock successful POST request
        mock.onPost('http://localhost:7086/notifications').reply(200);

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Subscribe/i }));

        // Expect success message
        expect(await screen.findByText(/Notification successfully created!/i)).toBeInTheDocument();

        // Ensure form fields are reset
        expect(screen.getByLabelText(/Email Address/i)).toHaveValue('');
        expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('');
        expect(screen.getByLabelText(/Indicator/i)).toHaveValue('Price');
        expect(screen.getByLabelText(/Threshold/i)).toHaveValue(null); // Number input reset to empty
        expect(screen.getByLabelText(/Condition/i)).toHaveValue('Above');
    });

    test('displays error message on failed form submission', async () => {
        setup('FB');

        // Fill in email
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@example.com' } });

        // Fill in other required fields
        fireEvent.change(screen.getByLabelText(/Indicator/i), { target: { value: 'RSI' } });
        fireEvent.change(screen.getByLabelText(/Threshold/i), { target: { value: '30' } });
        fireEvent.change(screen.getByLabelText(/Condition/i), { target: { value: 'Below' } });

        // Mock failed POST request
        mock.onPost('http://localhost:7086/notifications').reply(500);

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Subscribe/i }));

        // Expect error message
        expect(await screen.findByText(/Failed to create notification\. Please try again\./i)).toBeInTheDocument();
    });

    test('allows user to fill in both email and phone number', async () => {
        setup('NFLX');

        // Fill in email and phone number
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '9876543210' } });

        // Fill in other required fields
        fireEvent.change(screen.getByLabelText(/Indicator/i), { target: { value: 'Price' } });
        fireEvent.change(screen.getByLabelText(/Threshold/i), { target: { value: '200' } });
        fireEvent.change(screen.getByLabelText(/Condition/i), { target: { value: 'Above' } });

        // Mock successful POST request
        mock.onPost('http://localhost:7086/notifications').reply(200);

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Subscribe/i }));

        // Expect success message
        expect(await screen.findByText(/Notification successfully created!/i)).toBeInTheDocument();

        // Ensure form fields are reset
        expect(screen.getByLabelText(/Email Address/i)).toHaveValue('');
        expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('');
        expect(screen.getByLabelText(/Indicator/i)).toHaveValue('Price');
        expect(screen.getByLabelText(/Threshold/i)).toHaveValue(null); // Number input reset to empty
        expect(screen.getByLabelText(/Condition/i)).toHaveValue('Above');
    });
});
