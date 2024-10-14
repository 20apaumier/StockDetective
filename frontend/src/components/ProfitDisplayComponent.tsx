import React from 'react';

interface ProfitDisplayProps {
    totalProfit: number;
}

const ProfitDisplayComponent: React.FC<ProfitDisplayProps> = ({ totalProfit }) => {
    return (
        <div className="profit-display">
            <h3>Total Profit: ${totalProfit.toFixed(2)}</h3>
        </div>
    );
};

export default ProfitDisplayComponent;