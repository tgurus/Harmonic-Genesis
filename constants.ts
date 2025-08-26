
import { FunctionFamily, type FunctionDefinition, type AppState, type MappingMode } from './types';

export const COLOR_PALETTE: Record<FunctionFamily, { base: string, variants: string[] }> = {
  [FunctionFamily.Polynomial]: { base: '#9e9d24', variants: ['#c5e1a5', '#d4e157'] }, // Yellow-Green
  [FunctionFamily.Signal]: { base: '#00acc1', variants: ['#4dd0e1', '#80deea'] }, // Cyan-Teal
  [FunctionFamily.Chaotic]: { base: '#7cb342', variants: ['#7cb342'] }, // Lime Green
  [FunctionFamily.SuperComputable]: { base: '#8e24aa', variants: ['#ab47bc', '#ce93d8'] }, // Magenta-Purple
  [FunctionFamily.RealWorld]: { base: '#fb8c00', variants: ['#e53935'] }, // Orange-Red
};

export const FUNCTIONS: FunctionDefinition[] = [
  { id: 's_n', name: 'S(n)', family: FunctionFamily.Polynomial, definition: (n) => n, description: 'Simple linear growth.' },
  { id: 't_n', name: 'T(n)', family: FunctionFamily.Polynomial, definition: (n) => n * Math.log(n + 1), description: 'Log-linear growth.' },
  { id: 'm_n', name: 'M(n)', family: FunctionFamily.Polynomial, definition: (n) => 0.1 * n * n, description: 'Quadratic growth.' },
  { id: 'x1_n', name: 'X1(n)=n^6-n', family: FunctionFamily.Signal, definition: (n) => (n ^ 6) - n, description: 'Bitwise XOR operation.' },
  { id: 'x2_n', name: 'X2(n)=n|6-n', family: FunctionFamily.Signal, definition: (n) => (n | 6) - n, description: 'Bitwise OR operation.' },
  { id: 'x3_n', name: 'X3(n)=n&6-n', family: FunctionFamily.Signal, definition: (n) => (n & 6) - n, description: 'Bitwise AND operation.' },
  { id: 'tesla_n', name: 'Tesla(n)', family: FunctionFamily.Chaotic, definition: (n) => 100 * Math.sin(n * n * 0.01) * Math.cos(n * 0.1), description: 'A chaotic, unpredictable function.' },
  { id: 'b_n', name: 'B(n)', family: FunctionFamily.SuperComputable, definition: (n) => Math.pow(n, Math.log(n+1)+1) * 0.01, description: 'Rapidly growing, super-polynomial function.' },
  { id: 'bb_n', name: 'BB(n)', family: FunctionFamily.SuperComputable, definition: (n) => Math.pow(1.5, n) * Math.sin(n) * 5, description: 'Represents exponential, "uncomputable-like" growth.' },
];

export const CANONICAL_STATE: AppState = {
  parameters: {
    nMin: 0,
    nMax: 500,
    phi: 3.14, // Pi
    psi: 1.618, // Golden Ratio
    alf: 0, // log(1) = 0, so 10^0 = 1x scaling
    q: 0.1,
    htf: 1.0,
  },
  activeFunctionIds: ['s_n', 't_n', 'x1_n', 'tesla_n', 'b_n'],
  mapMode: "Log-Polar Spiral" as MappingMode,
};
