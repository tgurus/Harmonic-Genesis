import { PCA } from 'ml-pca';
import { FUNCTIONS } from '../constants';
import { FunctionFamily, type AppState, type FunctionDefinition, type PlotDataPoint, type PlotDataSeries, type PcaPlotData } from '../types';

// A simple placeholder for coupling coefficients. In a real scenario, this could be more complex.
const getCouplingCoefficient = (id1: string, id2: string): number => {
  // Hash the two IDs to get a pseudo-random but deterministic coefficient
  const combined = id1 + id2;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return (Math.abs(hash) % 100) / 100; // a value between 0 and 1
};

const getFunctionValues = (state: AppState): { activeFunctions: FunctionDefinition[], functionValues: Record<string, number[]>, nSteps: number } => {
    const { parameters, activeFunctionIds, realWorldData } = state;
    const { nMin, nMax } = parameters;

    const activeFunctions: FunctionDefinition[] = FUNCTIONS.filter(f => activeFunctionIds.includes(f.id));
  
    if (realWorldData && activeFunctionIds.includes('real_world')) {
        const realWorldFuncDef: FunctionDefinition = {
            id: 'real_world',
            name: realWorldData.name,
            family: FunctionFamily.RealWorld,
            definition: (n: number) => realWorldData.data[n] || 0,
            description: 'User-uploaded time series data.',
        };
        activeFunctions.push(realWorldFuncDef);
    }
    
    const nSteps = nMax - nMin + 1;
    if (nSteps <= 0 || activeFunctions.length === 0) {
        return { activeFunctions: [], functionValues: {}, nSteps: 0 };
    }

    const functionValues: Record<string, number[]> = {};
    activeFunctions.forEach(f => {
        functionValues[f.id] = [];
        for (let n = nMin; n <= nMax; n++) {
            functionValues[f.id].push(f.definition(n));
        }
    });

    return { activeFunctions, functionValues, nSteps };
}

export const calculatePlotData = (state: AppState): PlotDataSeries[] => {
  const { parameters } = state;
  const { nMin, phi, psi, alf, q } = parameters;
  const { activeFunctions, functionValues, nSteps } = getFunctionValues(state);
  
  if (nSteps === 0 || activeFunctions.length === 0) {
    return [];
  }
  
  const plotDataSeries: PlotDataSeries[] = activeFunctions.map(f_i => {
    const seriesData: PlotDataPoint[] = [];

    for (let n_idx = 0; n_idx < nSteps; n_idx++) {
      const n = nMin + n_idx;
      
      const f_i_val = functionValues[f_i.id][n_idx];

      // Directive 2: Implement a Concrete, Extensible Coupling Model
      let couplingTerm = 0;
      if (q > 0) {
        activeFunctions.forEach(f_j => {
          if (f_i.id !== f_j.id) {
            const f_j_val = functionValues[f_j.id][n_idx];
            const C_ij = getCouplingCoefficient(f_i.id, f_j.id);
            couplingTerm += C_ij * (f_j_val - f_i_val);
          }
        });
      }
      
      const radial_alf = Math.pow(10, alf);
      const r = (radial_alf * f_i_val) + (q * couplingTerm);
      const theta = (phi * n) + psi;

      seriesData.push({
        n: n,
        value: f_i_val,
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
      });
    }

    return {
      id: f_i.id,
      name: f_i.name,
      family: f_i.family,
      data: seriesData,
    };
  });

  return plotDataSeries;
};

export const calculatePcaProjection = (state: AppState): PcaPlotData => {
    const { parameters } = state;
    const { nMin } = parameters;
    const { activeFunctions, functionValues, nSteps } = getFunctionValues(state);
    
    if (activeFunctions.length < 2 || nSteps === 0) {
        return [];
    }

    const matrix: number[][] = [];
    for (let i = 0; i < nSteps; i++) {
        const row: number[] = [];
        activeFunctions.forEach(f => {
            row.push(functionValues[f.id][i] || 0);
        });
        matrix.push(row);
    }

    const pca = new PCA(matrix);
    // Project onto the first 2 principal components for 2D visualization
    const projected = pca.predict(matrix, { nComponents: 2 });
    
    const result: PcaPlotData = [];
    for (let i = 0; i < nSteps; i++) {
        const originalVector: Record<string, number> = {};
        activeFunctions.forEach(f => {
            originalVector[f.name] = functionValues[f.id][i];
        });
        
        result.push({
            n: nMin + i,
            x: projected.get(i, 0),
            y: projected.get(i, 1),
            originalVector: originalVector,
        });
    }

    return result;
}