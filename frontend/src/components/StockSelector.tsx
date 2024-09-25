import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './StockSelector.css';

interface StockSelectorProps {
    // callback function triggered when a stock is selected
    onSelectStock: (stockSymbol: string, startDate?: Date, endDate?: Date) => void;
}

const StockSelector: React.FC<StockSelectorProps> = ({ onSelectStock }) => {
    const [stockSymbol, setStockSymbol] = useState(''); // store stock symbol
    const [startDate, setStartDate] = useState<Date | null>(null); // Start date
    const [endDate, setEndDate] = useState<Date | null>(null); // End date

    // handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // prevent reload
        // call the function passed into props and making the stock full uppercase
        onSelectStock(stockSymbol.toUpperCase(), startDate || undefined, endDate || undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="stock-selector-form">
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
                        onChange={(date: Date | null) => setStartDate(date)}
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
                        onChange={(date: Date | null) => setEndDate(date)}
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