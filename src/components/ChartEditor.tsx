import React, { useState, useEffect } from 'react';
import { useChartStore } from '../store/chartStore';
import { RadarChart } from './RadarChart';
import { AlignmentTriangle } from './AlignmentTriangle';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Trash2, Plus, Minus, ArrowLeft, Settings, X, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const ChartEditor: React.FC = () => {
  const { charts, getActiveChart, updateChart, setActiveChart, deleteChart } = useChartStore();
  const chart = getActiveChart();
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const [chartSize, setChartSize] = useState(650);
  const [highlightedStatId, setHighlightedStatId] = useState<string | null>(null);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [comparisonChartIds, setComparisonChartIds] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      const maxSize = 650;
      const mobileSize = Math.min(window.innerWidth - 40, window.innerHeight - 200);
      setChartSize(window.innerWidth < 768 ? mobileSize : maxSize);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!chart) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-main-200">
        <p className="font-serif italic opacity-50">Select a grimoire from the shelf...</p>
      </div>
    );
  }

  const handleValueChange = (id: string, newValue: number) => {
    if (chart.type === 'radar') {
      const newData = chart.data.map(d => d.id === id ? { ...d, value: newValue } : d);
      updateChart(chart.id, { data: newData });
    }
  };

  const handleAlignmentChange = (values: { a: number; b: number; c: number }) => {
    if (chart.type === 'alignment') {
      updateChart(chart.id, { values });
    }
  };

  const addStat = () => {
    if (chart.type === 'radar') {
      updateChart(chart.id, {
        data: [...chart.data, { id: uuidv4(), label: 'New Stat', value: 50, fullMark: 100 }]
      });
    }
  };

  const removeStat = (statId: string) => {
    if (chart.type === 'radar' && chart.data.length > 3) {
      updateChart(chart.id, {
        data: chart.data.filter(d => d.id !== statId)
      });
    }
  };

  const updateStatLabel = (statId: string, label: string) => {
    if (chart.type === 'radar') {
      updateChart(chart.id, {
        data: chart.data.map(d => d.id === statId ? { ...d, label } : d)
      });
    }
  };

  const updateStatNotes = (statId: string, notes: string) => {
    if (chart.type === 'radar') {
      updateChart(chart.id, {
        data: chart.data.map(d => d.id === statId ? { ...d, notes } : d)
      });
    }
  };

  const updateAlignmentLabel = (index: number, label: string) => {
    if (chart.type === 'alignment') {
      const newLabels = [...chart.labels] as [string, string, string];
      newLabels[index] = label;
      updateChart(chart.id, { labels: newLabels });
    }
  };

  const handleStatClick = (statId: string) => {
    setHighlightedStatId(statId);
    setTimeout(() => setHighlightedStatId(null), 2000);
  };

  const renderConfigurationContent = () => (
    <div className="space-y-3">
      {chart.type === 'radar' ? (
        <div className="space-y-4">
          {/* Max Value Scale */}
          <div className="space-y-2 border-b border-main-400/30 pb-3">
            <label className="text-xs text-main-50 uppercase tracking-widest font-bold">Max Value Scale</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[6, 10, 20, 100].map(val => (
                <button
                  key={val}
                  onClick={() => {
                    const newData = chart.data.map(d => ({ ...d, fullMark: val, value: Math.min(d.value, val) }));
                    updateChart(chart.id, { data: newData });
                  }}
                  className={clsx(
                    "text-xs py-1 rounded border transition-colors font-serif",
                    chart.data[0]?.fullMark === val 
                      ? "bg-main-600 border-main-500 text-white" 
                      : "bg-main-800/20 border-main-400/50 text-main-50 hover:bg-main-700/30"
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
               <span className="text-xs text-main-400 font-serif italic">Custom:</span>
               <div className="flex items-center gap-0.5">
                 <button
                   onClick={() => {
                     const val = Math.max(1, (chart.data[0]?.fullMark || 100) - 1);
                     const newData = chart.data.map(d => ({ ...d, fullMark: val, value: Math.min(d.value, val) }));
                     updateChart(chart.id, { data: newData });
                   }}
                   className="bg-main-800/20 hover:bg-main-700/30 border border-main-400/50 rounded px-1 py-0.5 transition-colors"
                 >
                   <Minus size={12} />
                 </button>
                 <Input
                   type="number"
                   value={chart.data[0]?.fullMark || 100}
                   onChange={(e) => {
                     const val = Math.max(1, parseInt(e.target.value) || 100);
                     const newData = chart.data.map(d => ({ ...d, fullMark: val, value: Math.min(d.value, val) }));
                     updateChart(chart.id, { data: newData });
                   }}
                   className="text-xs py-0.5 w-14 text-center bg-transparent border-main-400/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                 />
                 <button
                   onClick={() => {
                     const val = Math.min(1000, (chart.data[0]?.fullMark || 100) + 1);
                     const newData = chart.data.map(d => ({ ...d, fullMark: val, value: Math.min(d.value, val) }));
                     updateChart(chart.id, { data: newData });
                   }}
                   className="bg-main-800/20 hover:bg-main-700/30 border border-main-400/50 rounded px-1 py-0.5 transition-colors"
                 >
                   <Plus size={12} />
                 </button>
               </div>
            </div>
          </div>

          {/* Stats List */}
          <div className="space-y-2">
             <label className="text-xs text-main-50 uppercase tracking-widest font-bold">Stats</label>
             {chart.data.map((stat) => {
               // Find comparison values for this stat
               const comparisonValues = comparisonChartIds
                 .map(id => charts.find(c => c.id === id))
                 .filter((c): c is NonNullable<typeof c> => c !== undefined && c.type === 'radar')
                 .map(compChart => {
                   if (compChart.type !== 'radar') return null;
                   const compStat = compChart.data.find((d: { label: string }) => d.label === stat.label);
                   return compStat ? { value: compStat.value, color: compChart.color } : null;
                 })
                 .filter((v): v is { value: number; color: string } => v !== null);

               return (
                <div 
                  key={stat.id} 
                  className={clsx(
                    "animate-fadeIn p-2 rounded-lg transition-all duration-300 border border-transparent",
                    highlightedStatId === stat.id 
                      ? "bg-main-600/20 border-main-500/50" 
                      : "hover:bg-main-800/10 hover:border-main-400/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 min-w-[1.5rem]">
                      <span className="text-base font-bold text-main-gold">{Math.round(stat.value)}</span>
                      {comparisonValues.map((comp, idx) => (
                        <span 
                          key={idx}
                          className="text-sm font-bold"
                          style={{ color: comp.color }}
                        >
                          / {Math.round(comp.value)}
                        </span>
                      ))}
                    </div>
                  <Input 
                    value={stat.label} 
                    onChange={(e) => updateStatLabel(stat.id, e.target.value)}
                    className="flex-1 text-sm py-1 bg-transparent focus:ring-0"
                    style={{ borderColor: 'var(--main-600)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--main-600)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--main-600)'}
                    placeholder="Stat name"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setExpandedNotesId(expandedNotesId === stat.id ? null : stat.id)}
                    className={clsx(
                      "px-2 border transition-colors focus:outline-none active:outline-none",
                      expandedNotesId === stat.id 
                        ? "text-main-gold bg-main-800/20" 
                        : "text-main-400 hover:text-main-200"
                    )}
                    style={{ 
                      borderColor: 'var(--main-600)'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--main-600)'}
                    onMouseDown={(e) => e.currentTarget.style.borderColor = 'var(--main-600)'}
                    title="Toggle notes"
                  >
                    <FileText size={14} />
                  </Button>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => removeStat(stat.id)}
                     disabled={chart.data.length <= 3}
                     className="text-red-300/70 hover:text-red-200 border border-red-900/30 hover:bg-red-900/20 px-2"
                   >
                     <Minus size={14} />
                   </Button>
                </div>
                {expandedNotesId === stat.id && (
                  <div className="mt-2 pt-2 flex">
                    <div className="min-w-[2rem]"></div>
                    <textarea
                      value={stat.notes || ''}
                      onChange={(e) => updateStatNotes(stat.id, e.target.value)}
                      className="flex-1 text-sm py-1.5 px-2 bg-transparent border focus:ring-0 rounded resize-y min-h-[60px] focus:outline-none"
                      style={{ borderColor: 'var(--main-600)' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--main-600)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--main-600)'}
                      placeholder="Add notes for this stat..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
              );
            })}
            <Button variant="secondary" size="sm" onClick={addStat} className="w-full mt-1 border-dashed border-main-600/50">
              <Plus size={16} /> Add Stat
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="text-xs text-main-50 uppercase tracking-widest font-bold">Labels</label>
          <div className="space-y-3">
            {['Top', 'Right', 'Left'].map((pos, i) => (
              <div key={pos} className="space-y-1">
                <label className="text-xs text-main-400 font-serif italic">{pos} Label</label>
                <Input 
                  value={chart.labels[i]} 
                  onChange={(e) => updateAlignmentLabel(i, e.target.value)}
                  className="text-sm py-1.5 bg-transparent border-main-400/30 focus:border-main-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full w-full">
      {/* =======================
          MOBILE LAYOUT 
          (Original Card Style) 
          ======================= */}
      <div className="md:hidden flex flex-col h-full bg-main-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-main-400/50 shadow-2xl">
        {/* Header */}
        <div className="p-3 border-b border-main-400/50 flex items-center gap-2 bg-main-800/30">
          <Button variant="ghost" size="sm" onClick={() => setActiveChart(null)} className="flex-shrink-0">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <Input 
              value={chart.name} 
              onChange={(e) => updateChart(chart.id, { name: e.target.value })}
              className="text-base font-serif font-bold bg-transparent border-none p-0 focus:ring-0 placeholder-main-600 mb-1"
              placeholder="Chart name..."
            />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMobileConfigOpen(!mobileConfigOpen)} 
            className="flex-shrink-0"
          >
            <Settings size={20} />
          </Button>
        </div>

        {/* Chart Visualization Area */}
        <div className="flex-1 p-4 flex items-center justify-center relative overflow-auto bg-main-900 gradient-container">
           {/* Background effects */}
           <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-main-900 via-main-800/80 via-main-800/60 to-main-800/40" />
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5 }}
             className="relative z-10 w-full flex items-center justify-center"
           >
             {chart.type === 'radar' ? (
               <RadarChart 
                 data={chart.data} 
                 color={chart.color}
                 onChange={handleValueChange}
                 onStatClick={handleStatClick}
                 size={chartSize}
                 className="drop-shadow-2xl max-w-full"
               />
             ) : (
               <AlignmentTriangle 
                 labels={chart.labels} 
                 values={chart.values}
                 onChange={handleAlignmentChange}
                 size={chartSize}
                 className="drop-shadow-2xl max-w-full"
               />
             )}
           </motion.div>
        </div>

        {/* Mobile Configuration Panel */}
        <AnimatePresence>
          {mobileConfigOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileConfigOpen(false)}
                className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
              />
              
              {/* Panel */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-main-900 border-t border-main-400 rounded-t-2xl z-40 max-h-[80vh] overflow-hidden flex flex-col"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-main-400">
                  <h3 className="text-main-gold font-serif text-base uppercase tracking-wider">Configuration</h3>
                  <Button variant="ghost" size="sm" onClick={() => setMobileConfigOpen(false)}>
                    <X size={20} />
                  </Button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chart.type === 'radar' && (
                     <div className="space-y-2 border-b border-main-400 pb-4">
                        <label className="text-xs text-main-50">Chart Color</label>
                        <input 
                          type="color" 
                          value={chart.color} 
                          onChange={(e) => updateChart(chart.id, { color: e.target.value })}
                          className="w-full h-12 rounded cursor-pointer bg-transparent border border-main-400"
                        />
                      </div>
                  )}
                  {renderConfigurationContent()}
                  <Button variant="danger" size="md" onClick={() => { deleteChart(chart.id); setMobileConfigOpen(false); }} className="w-full mt-6">
                    <Trash2 size={18} /> Delete Chart
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* =======================
          DESKTOP BOOK LAYOUT 
          (New Book Spread Style)
          ======================= */}
      <div className="hidden md:flex book-spread h-full w-full">
        {/* LEFT PAGE - Configuration */}
        <div className="flex-1 book-page book-page-left p-6 lg:p-8 flex flex-col relative overflow-hidden">
           {/* Shadows/Overlays */}
           <div className="book-binding-shadow-left" />
           <div className="book-edge-left absolute inset-0 pointer-events-none z-20" />
           
           {/* Header Area */}
           <div className="mb-4 border-b border-main-400/30 pb-3 relative z-10">
             <div className="flex justify-between items-start mb-2">
               <Input 
                 value={chart.name} 
                 onChange={(e) => updateChart(chart.id, { name: e.target.value })}
                 className="text-3xl lg:text-4xl font-bold bg-transparent border-none p-0 focus:ring-0 placeholder-main-600 text-main-100 w-full"
                 style={{ fontFamily: "'Dancing Script', cursive" }}
                 placeholder="Chart Name"
               />
               <Button variant="ghost" size="sm" onClick={() => deleteChart(chart.id)} className="text-red-400 hover:text-red-300 opacity-50 hover:opacity-100">
                  <Trash2 size={16} />
               </Button>
             </div>
             
             <Input 
               value={chart.description} 
               onChange={(e) => updateChart(chart.id, { description: e.target.value })}
               className="text-xs text-main-400 bg-transparent border-none p-0 focus:ring-0 placeholder-main-600/50 w-full italic"
               placeholder="Add a description..."
             />

             {chart.type === 'radar' && (
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-main-50 uppercase tracking-widest font-bold">Ink Color</label>
                  <div className="relative group">
                    <div className="w-5 h-5 rounded-full border border-main-400 shadow-sm" style={{ backgroundColor: chart.color }} />
                    <input 
                      type="color" 
                      value={chart.color} 
                      onChange={(e) => updateChart(chart.id, { color: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
             )}
           </div>

           {/* Configuration Area */}
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 relative z-10">
             {renderConfigurationContent()}
           </div>
        </div>

        {/* RIGHT PAGE - Visualization */}
        <div 
          className="flex-1 book-page book-page-right p-8 flex items-center justify-center relative bg-main-900/20"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('bg-main-800/10');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('bg-main-800/10');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('bg-main-800/10');
            const chartId = e.dataTransfer.getData('text/plain');
            if (chartId && chart.type === 'radar' && chartId !== chart.id && !comparisonChartIds.includes(chartId)) {
              const draggedChart = charts.find(c => c.id === chartId);
              if (draggedChart && draggedChart.type === 'radar') {
                setComparisonChartIds([...comparisonChartIds, chartId]);
              }
            }
          }}
        >
           {/* Shadows/Overlays */}
           <div className="book-binding-shadow-right" />
           <div className="book-edge-right absolute inset-0 pointer-events-none z-20" />
           
           {/* Subtle page texture overlay specific to the visual page */}
           <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_transparent_40%,_#1a0b2e_100%)]" />

           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="relative z-10 w-full flex items-center justify-center"
           >
             {chart.type === 'radar' ? (
               <>
                 <RadarChart 
                   data={chart.data} 
                   color={chart.color}
                   onChange={handleValueChange}
                   onStatClick={handleStatClick}
                   size={chartSize}
                   className="drop-shadow-2xl max-w-full"
                 />
                 {/* Comparison Charts Overlay */}
                 {comparisonChartIds.map((compId) => {
                   const compChart = charts.find(c => c.id === compId);
                   if (!compChart || compChart.type !== 'radar') return null;
                   return (
                     <div key={compId} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <RadarChart 
                         data={compChart.data} 
                         color={compChart.color}
                         size={chartSize}
                         readonly={true}
                         className="drop-shadow-2xl max-w-full opacity-60"
                       />
                     </div>
                   );
                 })}
                 {/* Comparison Chart Controls */}
                 {comparisonChartIds.length > 0 && (
                   <div className="absolute top-4 right-4 flex flex-wrap gap-2 z-20 pointer-events-auto">
                     {comparisonChartIds.map((compId) => {
                       const compChart = charts.find(c => c.id === compId);
                       if (!compChart) return null;
                       return (
                         <div
                           key={compId}
                           className="flex items-center gap-1 px-2 py-1 bg-main-800/80 rounded border border-main-600/50"
                         >
                           <div 
                             className="w-3 h-3 rounded-full border border-main-600/50"
                             style={{ backgroundColor: compChart.type === 'radar' ? compChart.color : '#4a3461' }}
                           />
                           <span className="text-xs text-main-200">{compChart.name}</span>
                           <button
                             onClick={() => setComparisonChartIds(comparisonChartIds.filter(id => id !== compId))}
                             className="ml-1 text-main-400 hover:text-main-200"
                           >
                             <X size={12} />
                           </button>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </>
             ) : (
               <AlignmentTriangle 
                 labels={chart.labels} 
                 values={chart.values}
                 onChange={handleAlignmentChange}
                 size={chartSize}
                 className="drop-shadow-2xl max-w-full"
               />
             )}
           </motion.div>
        </div>
      </div>
    </div>
  );
};
