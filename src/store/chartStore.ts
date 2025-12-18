import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StatChart, ChartType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ChartState {
  charts: StatChart[];
  activeChartId: string | null;
  
  addChart: (type: ChartType) => void;
  updateChart: (id: string, updates: Partial<StatChart>) => void;
  deleteChart: (id: string) => void;
  setActiveChart: (id: string | null) => void;
  getActiveChart: () => StatChart | undefined;
}

export const useChartStore = create<ChartState>()(
  persist(
    (set, get) => ({
      charts: [],
      activeChartId: null,

      addChart: (type) => {
        const newChart: StatChart = type === 'radar' 
          ? {
              id: uuidv4(),
              name: 'New Radar Chart',
              description: 'A new statistic chart',
              type: 'radar',
              createdAt: Date.now(),
              color: '#4a3461', // Desaturated main purple
              data: [
                { id: uuidv4(), label: 'Strength', value: 50, fullMark: 100 },
                { id: uuidv4(), label: 'Agility', value: 50, fullMark: 100 },
                { id: uuidv4(), label: 'Intelligence', value: 50, fullMark: 100 },
                { id: uuidv4(), label: 'Charisma', value: 50, fullMark: 100 },
                { id: uuidv4(), label: 'Wisdom', value: 50, fullMark: 100 },
              ]
            }
          : {
              id: uuidv4(),
              name: 'New Alignment',
              description: 'Three-point alignment',
              type: 'alignment',
              createdAt: Date.now(),
              labels: ['Mind', 'Body', 'Soul'],
              values: { a: 33, b: 33, c: 34 }
            };

        set((state) => ({ 
          charts: [...state.charts, newChart],
          activeChartId: newChart.id 
        }));
      },

      updateChart: (id, updates) => {
        set((state) => ({
          charts: state.charts.map((chart) => 
            chart.id === id ? { ...chart, ...updates } as StatChart : chart
          )
        }));
      },

      deleteChart: (id) => {
        set((state) => ({
          charts: state.charts.filter((c) => c.id !== id),
          activeChartId: state.activeChartId === id ? null : state.activeChartId
        }));
      },

      setActiveChart: (id) => set({ activeChartId: id }),

      getActiveChart: () => {
        const state = get();
        return state.charts.find((c) => c.id === state.activeChartId);
      }
    }),
    {
      name: 'rpg-stat-charts',
    }
  )
);

