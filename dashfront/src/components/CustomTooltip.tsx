import React from 'react';

// This is a standard structure for a recharts custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-sm text-gray-900">
                    <span style={{color: '#1313dc'}}>■</span> Job Count:
                    <span className="font-medium ml-1">{payload[0].value}</span>
                </p>
            </div>
        );
    }

    return null;
};

export default CustomTooltip;