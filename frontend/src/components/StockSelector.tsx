import React, { useState } from 'react';

interface StockSelectorProps {
    onSelectStock: (stockSymbol: string) => void;
}

const StockSelector: React.FC<StockSelectorProps> = ({ onSelectStock }) => {
    const [stockSymbol, setStockSymbol] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(`Submitting stock symbol: ${stockSymbol}`);
        onSelectStock(stockSymbol.toUpperCase());
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Stock Symbol:
                <input
                    type="text"
                    value={stockSymbol}
                    onChange={(e) => setStockSymbol(e.target.value)}
                />
            </label>
            <button type="submit">View Chart</button>
        </form>
    );
};

export default StockSelector;