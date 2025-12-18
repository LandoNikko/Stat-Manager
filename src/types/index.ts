export type ChartType = 'radar' | 'alignment';

export interface ChartBase {
  id: string;
  name: string;
  description: string;
  type: ChartType;
  createdAt: number;
}

export interface RadarStat {
  id: string;
  label: string;
  value: number; // 0 to max
  fullMark: number; // The max value for this axis, usually 100 or 10
  notes?: string; // Optional notes for this stat
}

export interface RadarChart extends ChartBase {
  type: 'radar';
  data: RadarStat[];
  color: string;
}

// For alignment, we can think of it as a point in a triangle (barycentric) or just 3 sliders that sum to 100?
// "3-point sliders with alignments" - Usually means a triangle plot.
export interface AlignmentChart extends ChartBase {
  type: 'alignment';
  labels: [string, string, string]; // e.g. ["Lawful", "Neutral", "Chaotic"] - wait, that's 1 axis. 
  // Maybe "Mind, Body, Soul" or "Power, Speed, Technique".
  // Coordinates in a triangle.
  values: {
    a: number; // Top
    b: number; // Right
    c: number; // Left
  };
}

export type StatChart = RadarChart | AlignmentChart;

