import React from 'react';
import './App.css';
import MultiChartComponent from './components/MultiChartComponent';

const App: React.FC = () => {

    return (
        <div className="app-container">
            <h1>Stock Analysis App</h1>
            <MultiChartComponent/>
        </div>
    );
};

export default App;
