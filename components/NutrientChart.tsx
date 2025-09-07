import React, { useMemo } from 'react';
import { Nutrient } from '../types';

// Since Recharts is loaded via CDN, we need to declare it on the window object for TypeScript.
declare global {
    interface Window {
        Recharts?: any;
    }
}

// Custom tooltip for better display
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-gray-900 border border-gray-700 rounded-md shadow-lg text-sm">
          <p className="font-bold text-brand-secondary">{`${label}`}</p>
          <p className="text-gray-300">{`Daily Value: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };


export const NutrientChart: React.FC<{ nutrients: Nutrient[] }> = ({ nutrients }) => {
    // Defer accessing Recharts until render time, and ensure it's loaded.
    if (typeof window === 'undefined' || !window.Recharts) {
        return (
             <div className="text-center text-gray-500 py-4">
                <p>Loading chart component...</p>
            </div>
        );
    }

    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = window.Recharts;

    const chartData = useMemo(() => {
        return nutrients
            .map(nutrient => {
                // Extracts the first number found in the dailyValue string
                const dvMatch = nutrient.dailyValue?.match(/(\d+(\.\d+)?)/);
                const dv = dvMatch ? parseFloat(dvMatch[1]) : null;
                return {
                    name: nutrient.name,
                    dv: dv,
                };
            })
            .filter(item => item.dv !== null && item.dv > 0) // Filter for items with a valid, positive DV
            .sort((a, b) => b.dv! - a.dv!); // Sort descending
    }, [nutrients]);

    if (chartData.length === 0) {
        return (
            <div className="text-center text-gray-500 py-4">
                <h4 className="font-semibold text-gray-300 mb-2">Nutrient Profile (% Daily Value)</h4>
                <p>No Daily Value percentages were found to generate a chart.</p>
            </div>
        );
    }
  
    return (
        <div>
            <h4 className="font-semibold text-gray-300 mb-4 text-center">Nutrient Profile (% Daily Value)</h4>
            <div style={{ width: '100%', height: 30 + chartData.length * 35 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{
                            top: 5,
                            right: 20,
                            left: 80, // Increased left margin for longer labels
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" horizontal={false} />
                        <XAxis 
                            type="number" 
                            stroke="#9CA3AF" 
                            domain={[0, 100]}
                            tick={{ fontSize: 12 }}
                            label={{ value: '% Daily Value', position: 'insideBottom', offset: -5, fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            stroke="#9CA3AF"
                            tick={{ fontSize: 12, fill: '#E5E7EB' }}
                            width={120} // Give more space for Y-axis labels
                            interval={0} // Ensure all labels are shown
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
                        <Bar dataKey="dv" name="Daily Value" fill="#00A878" background={{ fill: '#4A5568', opacity: 0.1 }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};