// NotificationsComponent.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface NotificationsProps {
    stockSymbol: string;
}

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
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [indicator, setIndicator] = useState<IndicatorType>('Price');
    const [threshold, setThreshold] = useState<number | ''>('');
    const [condition, setCondition] = useState<'Above' | 'Below'>('Above');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email && !phoneNumber) {
            setMessage({ type: 'error', text: 'Please provide either an email or phone number.' });
            return;
        }

        if (threshold === '' || isNaN(Number(threshold))) {
            setMessage({ type: 'error', text: 'Please enter a valid threshold value.' });
            return;
        }

        const notificationData: NotificationData = {
            email: email || null,
            phoneNumber: phoneNumber || null,
            indicator,
            stockSymbol,
            threshold: Number(threshold),
            condition,
        };

        try {
            await axios.post('http://localhost:7086/notifications', notificationData);
            setMessage({ type: 'success', text: 'Notification successfully created!' });
            // Reset form fields
            setEmail('');
            setPhoneNumber('');
            setIndicator('Price');
            setThreshold('');
            setCondition('Above');
        } catch (error) {
            console.error('Error creating notification:', error);
            setMessage({
                type: 'error',
                text: 'Failed to create notification. Please try again.',
            });
        }
    };

    return (
        <div className="notification-form">
            <h3>Set Up Notifications for {stockSymbol.toUpperCase()}</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">
                    Email Address:
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
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
                <button type="submit">Subscribe</button>
            </form>
            {message && (
                <p className={message.type === 'success' ? 'success-message' : 'error-message'}>
                    {message.text}
                </p>
            )}
        </div>
    );
};

export default NotificationsComponent;
