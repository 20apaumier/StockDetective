import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface StockSelectorProps {
    onSelectStock: (stockSymbol: string, startDate?: Date, endDate?: Date) => void;
}

const StockSelector: React.FC<StockSelectorProps> = ({ onSelectStock }) => {
    const [stockSymbol, setStockSymbol] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null); // Start date
    const [endDate, setEndDate] = useState<Date | null>(null); // End date

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSelectStock(stockSymbol.toUpperCase(), startDate || undefined, endDate || undefined);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Stock Symbol:
                    <input
                        type="text"
                        value={stockSymbol}
                        onChange={(e) => setStockSymbol(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Start Date:
                    <DatePicker
                        selected={startDate}
                        onChange={(date: Date) => setStartDate(date)}
                        maxDate={new Date()}
                        isClearable
                        placeholderText="Select a start date"
                    />
                </label>
            </div>
            <div>
                <label>
                    End Date:
                    <DatePicker
                        selected={endDate}
                        onChange={(date: Date) => setEndDate(date)}
                        maxDate={new Date()}
                        isClearable
                        placeholderText="Select an end date"
                    />
                </label>
            </div>
            <button type="submit">View Chart</button>
        </form>
    );
};

export default StockSelector;