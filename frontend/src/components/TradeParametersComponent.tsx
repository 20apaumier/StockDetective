import React, { useState } from 'react';

interface TradeParametersProps {
    onUpdate: (buy: number, sell: number) => void;
}

const TradeParametersComponent: React.FC<TradeParametersProps> = ({ onUpdate }) => {
    const [buyThreshold, setBuyThreshold] = useState<number | undefined>(undefined);
    const [sellThreshold, setSellThreshold] = useState<number | undefined>(undefined);

    const handleUpdate = () => {
        onUpdate(buyThreshold!, sellThreshold!);
    };

    return (
        <div className="trade-parameters">
            <h3>Set Trading Parameters</h3>
            <label>
                Buy Threshold:
                <input
                    type="number"
                    value={buyThreshold || ''}
                    onChange={(e) => setBuyThreshold(parseFloat(e.target.value))}
                />
            </label>
            <label>
                Sell Threshold:
                <input
                    type="number"
                    value={sellThreshold || ''}
                    onChange={(e) => setSellThreshold(parseFloat(e.target.value))}
                />
            </label>
            <button onClick={handleUpdate}>Update</button>
        </div>
    );
};

export default TradeParametersComponent;
