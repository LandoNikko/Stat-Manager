import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface AlignmentTriangleProps {
  labels: [string, string, string]; // Top, Right, Left (Standard ternary plot usually goes Top, Right, Left or similar)
  values: { a: number; b: number; c: number }; // a: Top, b: Right, c: Left
  onChange?: (values: { a: number; b: number; c: number }) => void;
  size?: number;
  readonly?: boolean;
  className?: string;
  color?: string;
}

export const AlignmentTriangle: React.FC<AlignmentTriangleProps> = ({
  labels,
  values,
  onChange,
  size = 400,
  readonly = false,
  className,
  color = '#4a3461'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const padding = 60;
  const sideLength = size - padding * 2;
  const height = sideLength * (Math.sqrt(3) / 2);
  
  const cx = size / 2;
  const cy = size / 2 + height / 6; // Center the triangle visually

  // Vertices
  const top = { x: cx, y: cy - (2/3) * height };
  const right = { x: cx + sideLength / 2, y: cy + (1/3) * height };
  const left = { x: cx - sideLength / 2, y: cy + (1/3) * height };

  // Calculate current position from values (barycentric to cartesian)
  // Assuming values sum to 100 roughly, normalize them first
  const sum = values.a + values.b + values.c || 1;
  const a = values.a / sum;
  const b = values.b / sum;
  const c = values.c / sum;

  const px = a * top.x + b * right.x + c * left.x;
  const py = a * top.y + b * right.y + c * left.y;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (readonly) return;
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    handlePointerMove(e); // Update immediately on click
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || readonly) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert Cartesian (mouseX, mouseY) to Barycentric (u, v, w)
    // Using formula for point inside triangle
    // u corresponds to Top (a), v to Right (b), w to Left (c)
    
    const detT = (right.y - left.y) * (top.x - left.x) + (left.x - right.x) * (top.y - left.y);
    const u = ((right.y - left.y) * (mouseX - left.x) + (left.x - right.x) * (mouseY - left.y)) / detT;
    const v = ((left.y - top.y) * (mouseX - left.x) + (top.x - left.x) * (mouseY - left.y)) / detT;
    const w = 1 - u - v;

    // Clamp values to stay inside triangle (0 <= val <= 1)
    // This simple clamping can distort near edges, but it's usually acceptable for UI
    // Better way: find closest point on triangle if outside.
    // For now, simple clamp and re-normalize.
    
    let newA = Math.max(0, u);
    let newB = Math.max(0, v);
    let newC = Math.max(0, w);
    
    const newSum = newA + newB + newC;
    newA = (newA / newSum) * 100;
    newB = (newB / newSum) * 100;
    newC = (newC / newSum) * 100;

    onChange?.({ a: newA, b: newB, c: newC });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div className={clsx("relative flex flex-col items-center select-none", className)}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="overflow-visible"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <filter id="glow-tri" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Triangle Background */}
        <polygon
          points={`${top.x},${top.y} ${right.x},${right.y} ${left.x},${left.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
        
        {/* Inner Grid Lines (optional, maybe connecting center) */}
        <line x1={cx} y1={cy + height/3} x2={top.x} y2={top.y} stroke="rgba(255,255,255,0.1)" />
        <line x1={cx} y1={cy + height/3} x2={right.x} y2={right.y} stroke="rgba(255,255,255,0.1)" />
        <line x1={cx} y1={cy + height/3} x2={left.x} y2={left.y} stroke="rgba(255,255,255,0.1)" />

        {/* Labels */}
        <text x={top.x} y={top.y - 20} textAnchor="middle" className="fill-main-100 text-sm font-serif">{labels[0]}</text>
        <text x={right.x + 20} y={right.y + 10} textAnchor="start" className="fill-main-100 text-sm font-serif">{labels[1]}</text>
        <text x={left.x - 20} y={left.y + 10} textAnchor="end" className="fill-main-100 text-sm font-serif">{labels[2]}</text>

        {/* Value Text */}
        <text x={top.x} y={top.y - 5} textAnchor="middle" className="fill-main-gold text-xs">{Math.round(values.a)}%</text>
        <text x={right.x + 10} y={right.y + 25} textAnchor="start" className="fill-main-gold text-xs">{Math.round(values.b)}%</text>
        <text x={left.x - 10} y={left.y + 25} textAnchor="end" className="fill-main-gold text-xs">{Math.round(values.c)}%</text>

        {/* The Point */}
        <motion.circle
          cx={px}
          cy={py}
          r={isDragging ? 14 : 10}
          fill={color}
          stroke="white"
          strokeWidth="2"
          filter="url(#glow-tri)"
          className="cursor-pointer hover:fill-main-gold transition-colors pointer-events-none"
          animate={{ cx: px, cy: py }}
          transition={isDragging ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {/* Connectors to corners (visual flair) */}
        <motion.line 
          x1={px} y1={py} x2={top.x} y2={top.y} 
          stroke={color} strokeOpacity="0.3" 
          animate={{ x1: px, y1: py }} 
          transition={isDragging ? { duration: 0 } : undefined}
        />
        <motion.line 
          x1={px} y1={py} x2={right.x} y2={right.y} 
          stroke={color} strokeOpacity="0.3" 
          animate={{ x1: px, y1: py }} 
          transition={isDragging ? { duration: 0 } : undefined}
        />
        <motion.line 
          x1={px} y1={py} x2={left.x} y2={left.y} 
          stroke={color} strokeOpacity="0.3" 
          animate={{ x1: px, y1: py }} 
          transition={isDragging ? { duration: 0 } : undefined}
        />

      </svg>
    </div>
  );
};

