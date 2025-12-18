import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RadarStat } from '../types';
import { polarToCartesian, valueToCoordinate } from '../utils/geometry';
import { clsx } from 'clsx';

interface RadarChartProps {
  data: RadarStat[];
  size?: number;
  color?: string;
  onChange?: (id: string, newValue: number) => void;
  onStatClick?: (id: string) => void;
  readonly?: boolean;
  className?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 400,
  color = '#4a3461',
  onChange,
  onStatClick,
  readonly = false,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Calculate padding based on text size - need more space for larger text
  // text-xl is ~1.25rem (20px), text-2xl is ~1.5rem (24px), plus spacing
  const labelHeight = 28 + 20; // number text height + label text height + spacing
  const padding = Math.max(80, labelHeight + 20); // Ensure enough padding for all angles
  const radius = (size - padding * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const numPoints = data.length;
  const angleStep = 360 / numPoints;

  // Calculate background web levels based on max value
  const maxValue = data[0]?.fullMark || 100;
  
  // Determine appropriate number of grid lines based on max value
  const calculateLevels = (max: number): number[] => {
    let numLevels = 5;
    
    if (max <= 10) {
      numLevels = max;
    } else if (max <= 20) {
      numLevels = max / 2;
    } else if (max <= 50) {
      numLevels = 5;
    } else if (max <= 100) {
      numLevels = 5;
    } else {
      numLevels = 5;
    }
    
    // Generate levels as fractions of max (1.0, 0.8, 0.6, etc.)
    const levels: number[] = [];
    for (let i = numLevels; i > 0; i--) {
      levels.push(i / numLevels);
    }
    return levels;
  };
  
  const levels = calculateLevels(maxValue);
  
  // Calculate polygon points
  const polygonPoints = data.map((stat, i) => {
    return valueToCoordinate(stat.value, stat.fullMark, radius, i * angleStep, cx, cy);
  });
  
  const polygonString = polygonPoints.map(p => `${p.x},${p.y}`).join(' ');

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    if (readonly) return;
    setDraggingId(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || readonly) return;
    
    const index = data.findIndex(d => d.id === draggingId);
    if (index === -1) return;

    const angle = index * angleStep;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Project mouse onto the axis vector
    // Vector from center to mouse
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    
    // Angle of the axis in radians (subtract 90 for SVG coords)
    const axisAngleRad = (angle - 90) * Math.PI / 180;
    
    // Unit vector of axis
    const axisX = Math.cos(axisAngleRad);
    const axisY = Math.sin(axisAngleRad);

    // Dot product to project
    const projection = dx * axisX + dy * axisY;
    
    // Normalize to 0-1 based on radius
    let newValue = (projection / radius) * data[index].fullMark;
    newValue = Math.max(0, Math.min(newValue, data[index].fullMark)); // Clamp

    onChange?.(draggingId, Math.round(newValue));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingId(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div className={clsx("relative flex flex-col items-center select-none", className)}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="overflow-visible"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <filter id={`glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient 
            id={`polyGradient-${color.replace('#', '')}`} 
            cx={cx} 
            cy={cy} 
            r={radius * 0.5}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="30%" stopColor={color} stopOpacity="0.6" />
            <stop offset="60%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </radialGradient>
          <radialGradient 
            id={`polyGlow-${color.replace('#', '')}`} 
            cx={cx} 
            cy={cy} 
            r={radius * 0.7}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="40%" stopColor={color} stopOpacity="0.5" />
            <stop offset="70%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <radialGradient 
            id={`innerGlow-${color.replace('#', '')}`} 
            cx={cx} 
            cy={cy} 
            r={radius * 0.4}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Axis Lines */}
        {data.map((stat, i) => {
          const endPoint = polarToCartesian(cx, cy, radius, i * angleStep);
          return (
            <g key={`axis-${i}`}>
              {/* Invisible thick line for interaction */}
              {!readonly && (
                <line
                  x1={cx}
                  y1={cy}
                  x2={endPoint.x}
                  y2={endPoint.y}
                  stroke="transparent"
                  strokeWidth="20"
                  onPointerDown={(e) => handlePointerDown(stat.id, e)}
                />
              )}
              {/* Visible thin line */}
              <line
                x1={cx}
                y1={cy}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke="#5e4679"
                strokeOpacity="0.3"
                strokeWidth="1"
                className="pointer-events-none"
              />
            </g>
          );
        })}

        {/* Background Web */}
        {levels.map((level, i) => (
          <polygon
            key={`web-${i}`}
            points={data.map((_, j) => {
              const p = polarToCartesian(cx, cy, radius * level, j * angleStep);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="#5e4679"
            strokeOpacity={i === 0 ? "0.4" : "0.2"}
            strokeWidth="1"
          />
        ))}

        {/* The Data Polygon - Base solid fill */}
        <motion.polygon
          points={polygonString}
          fill={color}
          fillOpacity="0.3"
          stroke="none"
          initial={false}
          animate={{ points: polygonString }}
          transition={draggingId ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {/* The Data Polygon - Outer Glow Layer */}
        <motion.polygon
          points={polygonString}
          fill={`url(#polyGlow-${color.replace('#', '')})`}
          stroke="none"
          initial={false}
          animate={{ points: polygonString }}
          transition={draggingId ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {/* The Data Polygon - Inner glow layer (bright center) */}
        <motion.polygon
          points={polygonString}
          fill={`url(#innerGlow-${color.replace('#', '')})`}
          stroke="none"
          initial={false}
          animate={{ points: polygonString }}
          transition={draggingId ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {/* The Data Polygon - Main gradient fill */}
        <motion.polygon
          points={polygonString}
          fill={`url(#polyGradient-${color.replace('#', '')})`}
          stroke={color}
          strokeWidth="2"
          filter={`url(#glow-${color.replace('#', '')})`}
          initial={false}
          animate={{ points: polygonString }}
          transition={draggingId ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Interactive Handles & Labels */}
        {data.map((stat, i) => {
          const point = polygonPoints[i];
          const angle = i * angleStep;
          
          // Calculate label offset based on angle to ensure equal visual distance
          // Text height: ~20px for label, ~24px for number, total ~44px
          // We want consistent margin from chart edge regardless of angle
          const textHeight = 44; // Approximate total text height
          const baseOffset = 50; // Base distance from chart edge
          
          // Adjust offset based on angle to account for text extending in different directions
          // For top (90°): text extends up, need more offset
          // For bottom (270°): text extends down, need more offset  
          // For sides (0°/180°): text extends horizontally, less offset needed
          const angleRad = (angle - 90) * Math.PI / 180;
          const verticalComponent = Math.abs(Math.sin(angleRad));
          
          // Adjust offset: more for vertical positions (top/bottom), less for horizontal (sides)
          const adjustedOffset = baseOffset + (textHeight / 2) * (1 + verticalComponent * 0.5);
          const labelPoint = polarToCartesian(cx, cy, radius + adjustedOffset, angle);
          
          return (
            <g key={stat.id}>
              {/* Clickable label background */}
              <rect
                x={labelPoint.x - 60}
                y={labelPoint.y - 22}
                width={120}
                height={50}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onStatClick?.(stat.id)}
              />
              
              {/* Label */}
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-main-100 text-xl font-serif pointer-events-none drop-shadow-md"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >
                {stat.label}
              </text>
              <text
                x={labelPoint.x}
                y={labelPoint.y + 28}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-main-gold text-2xl font-bold pointer-events-none"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >
                {Math.round(stat.value)}
              </text>

              {/* Handle */}
              {!readonly && (
                <>
                  {/* Invisible larger touch target at handle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={20}
                    fill="transparent"
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={(e) => handlePointerDown(stat.id, e)}
                  />
                  {/* Visible handle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={draggingId === stat.id ? 10 : 6}
                    fill={color}
                    stroke="#5e4679"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                    className="pointer-events-none hover:fill-main-gold transition-colors"
                    style={{ transition: draggingId === stat.id ? 'none' : 'r 0.2s ease, fill 0.2s ease' }}
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

