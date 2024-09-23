import React, { useState } from 'react';
import StockSelector from './components/StockSelector';
import ChartComponent from './components/ChartComponent';

const App: React.FC = () => {
    const [stockSymbol, setStockSymbol] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const handleSelectStock = (symbol: string, start?: Date, end?: Date) => {
        setStockSymbol(symbol);
        setStartDate(start);
        setEndDate(end);
    };

    return (
        <div>
            <h1>Stock Analysis App</h1>
            <StockSelector onSelectStock={handleSelectStock} />
            <ChartComponent stockSymbol={stockSymbol} startDate={startDate} endDate={endDate} />
        </div>
    );
};

export default App;
