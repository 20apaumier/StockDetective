// NotificationsComponent.tsx
import React, { useState } from 'react';
import axios from 'axios';

// stock symbol for which the notification is set
interface NotificationsProps {
    stockSymbol: string;
}

// all possible indicators (for now)
type IndicatorType = 'Price' | 'RSI' | 'MACD' | 'SMA';

interface NotificationData {
    email: string | null;
    phoneNumber: string | null;
    indicator: IndicatorType;
    stockSymbol: string;
    threshold: number;
    condition: 'Above' | 'Below';
}

const NotificationsComponent: React.FC<NotificationsProps> = ({ stockSymbol }) => {
    // states for the form fields
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [indicator, setIndicator] = useState<IndicatorType>('Price');
    const [threshold, setThreshold] = useState<number | ''>('');
    const [condition, setCondition] = useState<'Above' | 'Below'>('Above');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null
    );

    // Helper function to reset form fields after successful submission
    const resetForm = () => {
        setEmail('');
        setPhoneNumber('');
        setIndicator('Price');
        setThreshold('');
        setCondition('Above');
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for email or phone number
        if (!email && !phoneNumber) {
            setMessage({ type: 'error', text: 'Please provide either an email or phone number.' });
            return;
        }

        // Validation for threshold
        if (threshold === '' || isNaN(Number(threshold))) {
            setMessage({ type: 'error', text: 'Please enter a valid threshold value.' });
            return;
        }

        const notificationData: NotificationData = {
            email: email || null,
            phoneNumber: phoneNumber || null,
            indicator,
            stockSymbol,
            threshold: Number(threshold), // Ensure threshold is a number
            condition,
        };

        // API call to create notification
        try {
            await axios.post('http://localhost:7086/notifications', notificationData);
            setMessage({ type: 'success', text: 'Notification successfully created!' });
            resetForm(); // Reset the form after successful submission
        } catch (error) {
            console.error('Error creating notification:', error);
            setMessage({ type: 'error', text: 'Failed to create notification. Please try again.' });
        }
    };

    return (
        <div className="notification-form">
            <h3>Set Up Notifications for {stockSymbol.toUpperCase()}</h3>
            <form onSubmit={handleSubmit}>
                {/* Email Input */}
                <label htmlFor="email">
                    Email Address:
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                {/* Phone Number Input */}
                <label htmlFor="phoneNumber">
                    Phone Number:
                    <input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </label>
                <p>Please enter at least an email address or phone number.</p>

                {/* Indicator Selection */}
                <label htmlFor="indicator">
                    Indicator:
                    <select
                        id="indicator"
                        value={indicator}
                        onChange={(e) => setIndicator(e.target.value as IndicatorType)}
                        required
                    >
                        <option value="Price">Price</option>
                        <option value="RSI">RSI</option>
                        <option value="MACD">MACD</option>
                        <option value="SMA">SMA</option>
                    </select>
                </label>

                {/* Threshold Input */}
                <label htmlFor="threshold">
                    Threshold:
                    <input
                        id="threshold"
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.valueAsNumber || '')}
                        required
                    />
                </label>

                {/* Condition Selection */}
                <label htmlFor="condition">
                    Condition:
                    <select
                        id="condition"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as 'Above' | 'Below')}
                        required
                    >
                        <option value="Above">Above</option>
                        <option value="Below">Below</option>
                    </select>
                </label>

                {/* Submit Button */}
                <button type="submit">Subscribe</button>
            </form>

            {/* Display Message */}
            {message && (
                <p className={message.type === 'success' ? 'success-message' : 'error-message'}>
                    {message.text}
                </p>
            )}
        </div>
    );
};

export default NotificationsComponent;
