export enum FunctionFamily {
  Polynomial = "T/M/S (Polynomial)",
  Signal = "X (Signal/Bitwise)",
  Chaotic = "Tesla (Chaotic)",
  SuperComputable = "B/BB (Super-Computable)",
  RealWorld = "Real-World Data",
}

export interface FunctionDefinition {
  id: string;
  name: string;
  family: FunctionFamily;
  definition: (n: number) => number;
  description: string;
}

export interface SystemParameters {
  nMin: number;
  nMax: number;
  phi: number; // Angular Velocity
  psi: number; // Phase Offset
  alf: number; // Radial Scaling (log)
  q: number; // Coupling Strength
  htf: number; // Harmonic Tuning
}

export type MappingMode = "Log-Polar Spiral" | "Hypercube Projection" | "Binary State Plot";

export interface AppState {
  parameters: SystemParameters;
  activeFunctionIds: string[];
  mapMode: MappingMode;
  realWorldData?: { name: string; data: number[] };
}

export interface PlotDataPoint {
  n: number;
  value: number;
  x: number;
  y: number;
}

export interface PlotDataSeries {
  id: string;
  name: string;
  family: FunctionFamily;
  data: PlotDataPoint[];
}

export interface PcaPoint {
  n: number;
  x: number; // Principal Component 1
  y: number; // Principal Component 2
  originalVector: Record<string, number>; // e.g. { 'S(n)': 10, 'T(n)': 23.02 }
}

export type PcaPlotData = PcaPoint[];