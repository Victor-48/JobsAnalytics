export const formatValue = (value: number, total: number, unit: string) => {
    if (unit === 'percentage' && total > 0) {
        return `${((value / total) * 100).toFixed(1)}%`;
    }
    return value;
};

export const calculateTotal = (dataArray: any[], key: string) => 
    dataArray.reduce((acc, curr) => acc + (curr[key] || 0), 0);