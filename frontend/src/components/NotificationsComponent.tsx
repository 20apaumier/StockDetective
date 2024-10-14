import React, { useState } from 'react';
import axios from 'axios';

interface NotificationsProps {
    stockSymbol: string;
}

const NotificationsComponent: React.FC<NotificationsProps> = ({ stockSymbol }) => {
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [indicator, setIndicator] = useState('');
    const [threshold, setThreshold] = useState('');
    const [condition, setCondition] = useState<"Above" | "Below">("Above");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email && !phoneNumber) {
            alert('Please provide either an email or phone number.');
            return;
        }

        const notificationData = {
            email: email || null,
            phoneNumber: phoneNumber || null,
            indicator,
            stockSymbol,
            threshold: parseFloat(threshold),
            condition,
        };

        try {
            await axios.post('http://localhost:7086/notifications', notificationData);
            alert('Notification successfully created!');
            setEmail('');
            setPhoneNumber('');
            setIndicator('');
            setThreshold('');
            setCondition('Above');
        } catch (error) {
            console.error('Error creating notification:', error);
            alert('Failed to create notification. Please try again.');
        }
    };

    return (
        <div className="notification-form">
            <h3>Set Up Notifications for {stockSymbol.toUpperCase()}</h3>
            <form onSubmit={handleSubmit}>
                <label>
                    Email Address:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label>
                    Phone Number:
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </label>
                <p>Please enter at least an email address or phone number.</p>

                <label>
                    Indicator:
                    <select
                        value={indicator}
                        onChange={(e) => setIndicator(e.target.value)}
                        required
                    >
                        <option value="">Select Indicator</option>
                        <option value="Price">Price</option>
                        <option value="RSI">RSI</option>
                        <option value="MACD">MACD</option>
                        <option value="SMA">SMA</option>
                    </select>
                </label>
                <label>
                    Threshold:
                    <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Condition:
                    <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        required
                    >
                        <option value="Above">Above</option>
                        <option value="Below">Below</option>
                    </select>
                </label>
                <button type="submit">Subscribe</button>
            </form>
        </div>
    );
};

export default NotificationsComponent;
