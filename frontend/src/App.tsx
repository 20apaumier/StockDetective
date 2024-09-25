import React, { useState } from 'react';
import StockSelector from './components/StockSelector';
import ChartComponent from './components/ChartComponent';
import './App.css';

const App: React.FC = () => {
    const [stockSymbol, setStockSymbol] = useState(''); // store selected stock symbol
    const [startDate, setStartDate] = useState<Date | undefined>(undefined); // optional start date
    const [endDate, setEndDate] = useState<Date | undefined>(undefined); // optional end date

    // update states
    const handleSelectStock = (symbol: string, start?: Date, end?: Date) => {
        setStockSymbol(symbol);
        setStartDate(start);
        setEndDate(end);
    };

    return (
        <div className="app-container">
            <h1>Stock Analysis App</h1>
            <StockSelector onSelectStock={handleSelectStock} />
            <ChartComponent stockSymbol={stockSymbol} startDate={startDate} endDate={endDate} />
        </div>
    );
};

export default App;
