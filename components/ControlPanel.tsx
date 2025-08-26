
import React, { useRef } from 'react';
import type { AppState, FunctionDefinition, MappingMode } from '../types';
import { FUNCTIONS, CANONICAL_STATE } from '../constants';
import Icon from './Icon';

interface ControlPanelProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; step: number; hint?: string; }> = 
({ label, value, onChange, min, max, step, hint }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1" title={hint}>{label}: <span className="font-mono text-cyan-400">{value.toFixed(3)}</span></label>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
    </div>
);

const ControlPanel: React.FC<ControlPanelProps> = ({ state, setState }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleParamChange = (param: keyof AppState['parameters']) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, parameters: { ...prev.parameters, [param]: parseFloat(e.target.value) } }));
    };

    const handleFunctionToggle = (funcId: string) => {
        setState(prev => {
            const newActiveIds = prev.activeFunctionIds.includes(funcId)
                ? prev.activeFunctionIds.filter(id => id !== funcId)
                : [...prev.activeFunctionIds, funcId];
            return { ...prev, activeFunctionIds: newActiveIds };
        });
    };
    
    const handleMapModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setState(prev => ({ ...prev, mapMode: e.target.value as MappingMode }));
    };

    const handleSaveState = () => {
        const stateString = JSON.stringify(state, null, 2);
        const blob = new Blob([stateString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'harmonic_genesis_state.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLoadState = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const loadedState = JSON.parse(event.target?.result as string);
                    // Add validation here in a real app
                    setState(loadedState);
                } catch (error) {
                    console.error("Failed to load state:", error);
                    alert("Error: Could not parse the state file. Please ensure it's a valid JSON configuration.");
                }
            };
            reader.readAsText(file);
        }
    };

  return (
    <div className="w-full md:w-96 bg-gray-800 p-4 overflow-y-auto flex-shrink-0">
        <h2 className="text-xl font-bold mb-4 text-white">Controls</h2>

        <div className="space-x-1 flex mb-4">
            <button onClick={handleSaveState} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md inline-flex items-center justify-center text-sm transition-colors">
                <Icon path="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" className="w-5 h-5 mr-2" /> Save
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md inline-flex items-center justify-center text-sm transition-colors">
                <Icon path="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" className="w-5 h-5 mr-2" /> Load
            </button>
            <input type="file" ref={fileInputRef} onChange={handleLoadState} accept=".json" className="hidden" />
            <button onClick={() => setState(CANONICAL_STATE)} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-md inline-flex items-center justify-center text-sm transition-colors" title="Reset to Canonical Configuration">
                 <Icon path="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.695v4.992m0 0h-4.992m4.992 0-3.181-3.183a8.25 8.25 0 0 0-11.667 0L2.985 16.95z" className="w-5 h-5 mr-2" /> Reset
            </button>
        </div>
        
        <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">System Parameters</h3>
            <Slider label="n Range Max" value={state.parameters.nMax} onChange={handleParamChange('nMax')} min={10} max={2000} step={10} hint="Maximum value for the sequence index 'n'"/>
            <Slider label="φ (Ang. Velocity)" value={state.parameters.phi} onChange={handleParamChange('phi')} min={0} max={6.283} step={0.01} hint="Controls the base rate of angular progression per increment of n."/>
            <Slider label="ψ (Phase Offset)" value={state.parameters.psi} onChange={handleParamChange('psi')} min={0} max={6.283} step={0.01} hint="Sets the initial angular offset at n=0." />
            <Slider label="α (Radial Scaling)" value={state.parameters.alf} onChange={handleParamChange('alf')} min={-3} max={3} step={0.1} hint="Logarithmic global scaling coefficient for the radial component r(n)." />
            <Slider label="q (Coupling)" value={state.parameters.q} onChange={handleParamChange('q')} min={0} max={2} step={0.01} hint="Generic parameter to control the strength of interaction terms between functions." />
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Visualization Mode</h3>
            <select value={state.mapMode} onChange={handleMapModeChange} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                <option>Log-Polar Spiral</option>
                <option>Hypercube Projection</option>
                <option>Binary State Plot</option>
            </select>
        </div>
        
        <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Active Functions</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {FUNCTIONS.map(func => (
                    <label key={func.id} className="flex items-center p-2 bg-gray-900 rounded-md hover:bg-gray-700 transition-colors cursor-pointer" title={func.description}>
                        <input type="checkbox" checked={state.activeFunctionIds.includes(func.id)} onChange={() => handleFunctionToggle(func.id)} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 bg-gray-700" />
                        <span className="ml-3 text-sm text-gray-300">{func.name} <span className="text-gray-500 text-xs">({func.family.split(' ')[0]})</span></span>
                    </label>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ControlPanel;
