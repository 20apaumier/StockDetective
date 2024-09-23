import React, { useState } from 'react'
import StockSelector from './components/StockSelector'
//import IndicatorSelector from './components/IndicatorSelector'
import ChartComponent from './components/ChartComponent'
import './App.css'

const App: React.FC = () => {
    const [stockSymbol, setStockSymbol] = useState('');
    //const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);

    return (
        <div>
            <h1>Stock Analysis App</h1>
            <StockSelector onSelectStock={setStockSymbol} />
            <ChartComponent stockSymbol={stockSymbol} />
        </div>
    );
};

export default App
