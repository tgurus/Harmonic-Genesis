import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Scatter, ZAxis } from 'recharts';
import type { AppState, PlotDataSeries, PcaPlotData } from '../types';
import { calculatePlotData, calculatePcaProjection } from '../services/harmonicMapper';
import { COLOR_PALETTE, FUNCTIONS } from '../constants';
import Icon from './Icon';

// Tooltip for Log-Polar Spiral plot
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const functionDef = FUNCTIONS.find(f => f.name === payload[0].name);
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 shadow-lg">
        <p className="font-bold text-base text-cyan-400">{payload[0].name}</p>
        {functionDef && <p className="text-xs text-gray-400 mb-2">{functionDef.family}</p>}
        <p><span className="font-semibold">Index n:</span> {data.n}</p>
        <p><span className="font-semibold">Value f(n):</span> {data.value.toFixed(3)}</p>
        <p><span className="font-semibold">Coord (x,y):</span> ({data.x.toFixed(2)}, {data.y.toFixed(2)})</p>
      </div>
    );
  }
  return null;
};

// Tooltip for Hypercube Projection (PCA) plot
const PcaTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 shadow-lg w-64">
        <p className="font-bold text-base text-cyan-400">System State Projection</p>
        <p className="mb-2"><span className="font-semibold">Index n:</span> {data.n}</p>
        <div className="border-t border-gray-700 pt-2 mt-2">
            <p className="font-semibold text-gray-400 text-xs mb-1">Original Vector:</p>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
            {Object.entries(data.originalVector).map(([name, value]) => (
                <div key={name} className="flex justify-between text-xs">
                    <span className="text-gray-300 truncate pr-2">{name}:</span>
                    <span className="font-mono text-cyan-400">{(value as number).toFixed(2)}</span>
                </div>
            ))}
            </div>
        </div>
      </div>
    );
  }
  return null;
};

const BitTrack: React.FC<{ binaryString: string }> = ({ binaryString }) => (
    <div className="flex">
        {binaryString.split('').map((bit, index) => (
            <span
                key={index}
                className={`block w-2.5 h-4 ${bit === '1' ? 'bg-cyan-400' : 'bg-gray-600'}`}
                title={`bit ${binaryString.length - 1 - index}: ${bit}`}
            />
        ))}
    </div>
);

const BinaryStatePlot: React.FC<{ plotData: PlotDataSeries[] }> = ({ plotData }) => {
    const bitwiseFunctions = plotData.filter(p => p.family === 'X (Signal/Bitwise)');
    if (bitwiseFunctions.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Select a Bitwise function (X family) to use this view.</div>;
    }

    const toBinary = (n: number, pad: number) => {
        const bin = (n >>> 0).toString(2); // Ensure positive integer for correct binary
        return bin.padStart(pad, '0');
    }

    const bitwiseOps: { [id: string]: { op: (a: number, b: number) => number, symbol: string }} = {
        'x1_n': { op: (a, b) => a ^ b, symbol: '^'},
        'x2_n': { op: (a, b) => a | b, symbol: '|'},
        'x3_n': { op: (a, b) => a & b, symbol: '&'},
    };
    const operand = 6; // Hardcoded from function definitions in constants.ts
    const bitWidth = 8;

    return (
        <div className="p-4 overflow-auto h-full text-gray-300">
            <h3 className="text-lg font-bold mb-4">Binary State Visualization</h3>
            {bitwiseFunctions.map(funcSeries => {
                const opDetails = bitwiseOps[funcSeries.id];
                if (!opDetails) return null;

                return (
                    <div key={funcSeries.id} className="mb-6 bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-md font-semibold text-cyan-400 mb-3">{funcSeries.name}</h4>
                        <div className="font-mono text-xs space-y-2 overflow-x-auto">
                           <div className="flex items-center space-x-4 mb-2 text-gray-400 text-[10px] uppercase">
                                <span className="w-8">n</span>
                                <span style={{width: `${bitWidth * 0.625}rem`}}>Value of n</span>
                                <span className="w-4 text-center">Op</span>
                                <span style={{width: `${bitWidth * 0.625}rem`}}>Operand</span>
                                <span className="w-4 text-center">=</span>
                                <span style={{width: `${bitWidth * 0.625}rem`}}>Result</span>
                           </div>
                            {funcSeries.data.slice(0, 50).map(point => {
                                const n = point.n;
                                const result = opDetails.op(n, operand);
                                return (
                                    <div key={n} className="flex items-center space-x-4">
                                        <span className="w-8 text-gray-500">{n}</span>
                                        <BitTrack binaryString={toBinary(n, bitWidth)} />
                                        <span className="text-cyan-500 w-4 text-center">{opDetails.symbol}</span>
                                        <BitTrack binaryString={toBinary(operand, bitWidth)} />
                                        <span className="text-gray-500 w-4 text-center">=</span>
                                        <BitTrack binaryString={toBinary(result, bitWidth)} />
                                    </div>
                                );
                            })}
                        </div>
                         {funcSeries.data.length > 50 && <div className="text-xs text-gray-500 mt-2">Showing first 50 steps...</div>}
                    </div>
                )
            })}
        </div>
    );
};

const Visualization: React.FC<{ state: AppState }> = ({ state }) => {
  const [loading, setLoading] = useState(true);
  const [plotData, setPlotData] = useState<PlotDataSeries[]>([]);
  const [pcaData, setPcaData] = useState<PcaPlotData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Directive 3: Asynchronous Computation for all plot types
  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      try {
        if (state.mapMode === 'Hypercube Projection') {
          const data = calculatePcaProjection(state);
          setPcaData(data);
          setPlotData([]);
        } else {
          const data = calculatePlotData(state);
          setPlotData(data);
          setPcaData(null);
        }
      } catch (e) {
        console.error("Error calculating plot data:", e);
        setError(e instanceof Error ? e.message : "An unknown error occurred during calculation.");
        setPlotData([]);
        setPcaData(null);
      } finally {
        setLoading(false);
      }
    }, 50); // Small delay to allow UI to update to loading state

    return () => clearTimeout(timer);
  }, [state]);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    FUNCTIONS.forEach(f => {
        const familyColors = COLOR_PALETTE[f.family];
        if (familyColors) {
            // Very simple assignment, can be improved to cycle through variants
             map.set(f.id, familyColors.variants[0] || familyColors.base);
        }
    });
    map.set('real_world', COLOR_PALETTE['Real-World Data'].base);
    return map;
  }, []);
  
  const renderContent = () => {
    if (error) {
        return <div className="flex items-center justify-center h-full text-red-400 p-4">Error: {error}</div>
    }
    
    if (state.mapMode === "Binary State Plot") {
        return <BinaryStatePlot plotData={plotData} />;
    }

    if (state.mapMode === 'Hypercube Projection') {
        if (!pcaData || pcaData.length === 0) {
             return <div className="flex items-center justify-center h-full text-gray-500">Not enough data for PCA. Select at least 2 functions.</div>
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 40, bottom: 30, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" dataKey="x" name="PC1" tick={{ fill: '#9ca3af' }} stroke="#4b5563" domain={['auto', 'auto']} label={{ value: 'Principal Component 1', position: 'insideBottom', offset: -15, fill: '#9ca3af' }} />
                    <YAxis type="number" dataKey="y" name="PC2" tick={{ fill: '#9ca3af' }} stroke="#4b5563" domain={['auto', 'auto']} label={{ value: 'Principal Component 2', angle: -90, position: 'insideLeft', offset: 0, fill: '#9ca3af', style: {textAnchor: 'middle'} }} />
                    <Tooltip content={<PcaTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="System Trajectory" data={pcaData} fill="#06b6d4" line={{ stroke: '#0891b2', strokeWidth: 2 }} shape="circle" />
                </ScatterChart>
            </ResponsiveContainer>
        );
    }
    
    if (state.mapMode === 'Log-Polar Spiral') {
      if (plotData.length === 0) {
          return <div className="flex items-center justify-center h-full text-gray-500">No functions selected or data available.</div>
      }
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" dataKey="x" name="x" tick={{ fill: '#9ca3af' }} stroke="#4b5563" domain={['auto', 'auto']} />
            <YAxis type="number" dataKey="y" name="y" tick={{ fill: '#9ca3af' }} stroke="#4b5563" domain={['auto', 'auto']} />
            <ZAxis type="number" range={[10, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            {plotData.map(series => (
              <Scatter key={series.id} name={series.name} data={series.data} fill={colorMap.get(series.id) || '#8884d8'} line shape="circle" lineType="joint" />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return null;
  }

  return (
    <div className="flex-1 bg-gray-900 relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <Icon path="M10.343 3.94c.09-.542.56-1.007 1.11-1.227l.128-.051c.683-.274 1.437-.274 2.12 0l.128.051c.55.22 1.02.685 1.11 1.227l.082.498a11.996 11.996 0 0 1 2.373 1.266l.43.255c.523.31 1.025.792 1.258 1.348l.098.232c.24.575.24 1.225 0 1.8l-.098.232c-.233.556-.735 1.038-1.258 1.348l-.43.255a11.996 11.996 0 0 1-2.373 1.266l-.082.498c-.09.542-.56 1.007-1.11 1.227l-.128.051c-.683-.274-1.437-.274-2.12 0l-.128-.051c-.55-.22-1.02-.685-1.11-1.227l-.082-.498a11.996 11.996 0 0 1-2.373-1.266l-.43-.255c-.523-.31-1.025-.792-1.258-1.348l-.098-.232c-.24-.575-.24-1.225 0-1.8l.098-.232c.233-.556.735-1.038-1.258-1.348l.43-.255a11.996 11.996 0 0 1 2.373-1.266l.082-.498Zm-1.558 5.48a.75.75 0 1 0-1.06-1.061 8.25 8.25 0 0 1 11.668 0 .75.75 0 1 0 1.06 1.061 9.75 9.75 0 0 0-13.788 0Z" className="w-12 h-12 text-cyan-500 animate-spin" />
            <p className="mt-4 text-lg text-gray-300">Computing...</p>
          </div>
        </div>
      )}
      {renderContent()}
    </div>
  );
};

export default Visualization;