/**
 * Optimized Bouncing Ball Spinner Component
 * Based on SVG Spinners by Utkarsh Verma
 * https://github.com/n3r4zzurr0/svg-spinners
 */

import type { SpinnerProps, LoadingSpinnerProps } from '@/types/spinner';

export function Spinner({ 
  className = "w-10 h-10", 
  size = 32,
  color = "currentColor" 
}: SpinnerProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24"
      className={className}
      aria-label="Loading"
      role="status"
    >
      <ellipse 
        cx="12" 
        cy="5" 
        fill={color} 
        rx="4" 
        ry="4"
      >
        {/* Main bounce animation */}
        <animate 
          id="bounce-down" 
          fill="freeze" 
          attributeName="cy" 
          begin="0;bounce-up.end" 
          calcMode="spline" 
          dur="0.375s" 
          keySplines=".33,0,.66,.33" 
          values="5;20"
        />
        
        {/* Squash on impact - horizontal */}
        <animate 
          attributeName="rx" 
          begin="bounce-down.end" 
          calcMode="spline" 
          dur="0.05s" 
          keySplines=".33,0,.66,.33;.33,.66,.66,1" 
          values="4;4.8;4"
        />
        
        {/* Squash on impact - vertical */}
        <animate 
          attributeName="ry" 
          begin="bounce-down.end" 
          calcMode="spline" 
          dur="0.05s" 
          keySplines=".33,0,.66,.33;.33,.66,.66,1" 
          values="4;3;4"
        />
        
        {/* Slight settle */}
        <animate 
          id="settle" 
          attributeName="cy" 
          begin="bounce-down.end" 
          calcMode="spline" 
          dur="0.025s" 
          keySplines=".33,0,.66,.33" 
          values="20;20.5"
        />
        
        {/* Bounce up */}
        <animate 
          id="bounce-up" 
          attributeName="cy" 
          begin="settle.end" 
          calcMode="spline" 
          dur="0.4s" 
          keySplines=".33,.66,.66,1" 
          values="20.5;5"
        />
      </ellipse>
    </svg>
  );
}

/**
 * Centered loading state with spinner and text
 */
export function LoadingSpinner({ 
  text = "Loading",
  className = ""
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center gap-3 py-8 ${className}`}>
      <Spinner className="w-10 h-10 text-emerald-500" />
      <span className="text-zinc-500 text-xs uppercase tracking-wider">
        {text}
      </span>
    </div>
  );
}

