import React from 'react';
import { useChartStore } from '../store/chartStore';
import { ChartEditor } from './ChartEditor';
import { Button } from './ui/Button';
import { Plus, BarChart2, Triangle, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { charts, activeChartId, addChart, setActiveChart } = useChartStore();

  return (
    <div className="flex h-screen bg-main-900 text-white overflow-hidden font-sans selection:bg-main-500 selection:text-white">
      {/* Sidebar List (Bookshelf) */}
      <div className={clsx(
        "w-full md:w-80 flex flex-col bookshelf z-20 transition-all absolute md:relative h-full",
        activeChartId ? "-translate-x-full md:translate-x-0" : "translate-x-0"
      )}>
        <div className="p-6 border-b border-main-700/50 bg-main-900/30 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 h-full flex items-center opacity-10 text-main-gold">
            <img src={`${import.meta.env.BASE_URL}spellbook.svg`} alt="" className="h-full w-auto brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-main-gold mb-1 relative z-10" style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}>Grimoire</h1>
          <p className="text-xs text-main-50 relative z-10">Stat Chart Manager</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {charts.map((chart) => (
            <motion.div
              key={chart.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div
                onClick={() => setActiveChart(chart.id)}
                draggable
                onDragStart={(e: React.DragEvent) => {
                  e.dataTransfer.setData('text/plain', chart.id);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className={clsx(
                  "p-3 cursor-pointer transition-all duration-300 group book-spine rounded-r-md",
                  activeChartId === chart.id 
                    ? "active" 
                    : "bg-main-800/20 hover:bg-main-800/40 border-l-4 border-transparent hover:border-main-600"
                )}
              >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "p-2 rounded transition-colors", 
                  chart.type === 'radar' 
                    ? "text-main-200 group-hover:text-white" 
                    : "text-teal-300 group-hover:text-teal-100"
                )}>
                  {chart.type === 'radar' ? <BarChart2 size={18} /> : <Triangle size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={clsx("font-serif font-bold truncate text-base", activeChartId === chart.id ? "text-main-gold" : "text-main-100")}>
                    {chart.name}
                  </h3>
                  <p className="text-xs text-main-400 truncate opacity-70">{chart.description}</p>
                </div>
              </div>
              </div>
            </motion.div>
          ))}

          {charts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-main-500 opacity-60 text-center px-4">
              <Sparkles className="mb-4 opacity-50" />
              <p className="font-serif">The archives are empty.</p>
              <p className="text-xs mt-2">Create a new chart to begin your journey.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-main-700/50 bg-main-900/30 backdrop-blur-sm">
          <p className="text-xs text-main-400 mb-2 font-serif text-center uppercase tracking-widest">Create New</p>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => addChart('radar')} size="sm" className="text-xs">
              <Plus size={14} /> Radar
            </Button>
            <Button onClick={() => addChart('alignment')} size="sm" variant="secondary" className="text-xs">
              <Plus size={14} /> Alignment
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content (Desk) */}
      <div className="flex-1 relative h-full flex flex-col min-w-0 book-container">
         <div className="relative z-10 h-full p-2 md:p-8 flex flex-col">
            <ChartEditor />
         </div>
      </div>
    </div>
  );
};
