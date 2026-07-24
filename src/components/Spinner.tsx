/**
 * Iconify svg-spinners:blocks-wave Loading Spinner Component
 */

import type { SpinnerProps, LoadingSpinnerProps } from '@/types/spinner';

export function Spinner({ 
  className = "w-10 h-10", 
  size = 40,
  color = "currentColor" 
}: SpinnerProps) {
  return (
    <div 
      className={`${className} relative inline-flex items-center justify-center`}
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24"
        fill={color}
      >
        <rect width="7.33" height="7.33" x="1" y="1" fill="currentColor">
          <animate id="bw0" attributeName="x" begin="0;bw8.end+0.2s" dur="0.6s" values="1;4;1"/>
          <animate attributeName="y" begin="0;bw8.end+0.2s" dur="0.6s" values="1;4;1"/>
          <animate attributeName="width" begin="0;bw8.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
          <animate attributeName="height" begin="0;bw8.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
        </rect>
        <rect width="7.33" height="7.33" x="8.33" y="1" fill="currentColor">
          <animate attributeName="x" begin="bw0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
          <animate attributeName="y" begin="bw0.begin+0.1s" dur="0.6s" values="1;4;1"/>
          <animate attributeName="width" begin="bw0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
          <animate attributeName="height" begin="bw0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
        </rect>
        <rect width="7.33" height="7.33" x="1" y="8.33" fill="currentColor">
          <animate attributeName="x" begin="bw0.begin+0.1s" dur="0.6s" values="1;4;1"/>
          <animate attributeName="y" begin="bw0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/>
          <animate attributeName="width" begin="bw0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
          <animate attributeName="height" begin="bw0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/>
        </rect>
        <rect width="7.33" height="7.33" x="15.66" y="1" fill="currentColor">
          <animate attributeName="x" begin="bw0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
          <animate attributeName="y" begin="bw0.begin+0.2s" dur="0.6s" values="1;4;1"/>
          <animate attributeName="width" begin="bw0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
          <animate attributeName="height" begin="bw0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
        </rect>
        <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="currentColor">
          <animate attributeName="x" begin="bw0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
          <animate attributeName="y" begin="bw0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/>
          <animate attributeName="width" begin="bw0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
          <animate attributeName="height" begin="bw0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
        </rect>
        <rect width="7.33" height="7.33" x="1" y="15.66" fill="currentColor">
          <animate attributeName="x" begin="bw0.begin+0.2s" dur="0.6s" values="1;4;1"/>
          <animate attributeName="y" begin="bw0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/>
          <animate attributeName="width" begin="bw0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
          <animate attributeName="height" begin="bw0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/>
        </rect>
        <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="currentColor">
          <animate attributeName="x" begin="bw0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
          <animate attributeName="y" begin="bw0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
          <animate attributeName="width" begin="bw0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
          <animate attributeName="height" begin="bw0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
        </rect>
        <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="currentColor">
          <animate attributeName="x" begin="bw0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/>
          <animate attributeName="y" begin="bw0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/>
          <animate attributeName="width" begin="bw0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
          <animate attributeName="height" begin="bw0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/>
        </rect>
        <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="currentColor">
          <animate id="bw8" attributeName="x" begin="bw0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
          <animate attributeName="y" begin="bw0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/>
          <animate attributeName="width" begin="bw0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
          <animate attributeName="height" begin="bw0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/>
        </rect>
      </svg>
    </div>
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
      <Spinner className="w-10 h-10 text-white" />
      <span className="text-zinc-500 text-xs uppercase tracking-wider">
        {text}
      </span>
    </div>
  );
}
