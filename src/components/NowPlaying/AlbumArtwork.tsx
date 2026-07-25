'use client';

import { useState, useRef, MouseEvent } from 'react';
import type { AlbumArtworkProps } from '@/types/music';
import { AlbumArtworkAmbientGlow } from './AlbumArtworkAmbientGlow';
import { AlbumArtworkFront } from './AlbumArtworkFront';
import { AlbumArtworkBack } from './AlbumArtworkBack';

/**
 * Interactive 3D Flipping Album Artwork Orchestrator Component
 * Mouse tilt on outer wrapper (100ms), smooth 3D flip on inner wrapper (950ms)
 */
export function AlbumArtwork({ src, alt = "Album Art" }: AlbumArtworkProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<string>('rotateX(0deg) rotateY(0deg)');
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // Tilt up/down up to 12deg
    const rotateY = ((x - centerX) / centerX) * 12;  // Tilt left/right up to 12deg

    setTiltStyle(`rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle('rotateX(0deg) rotateY(0deg)');
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  return (
    <div className="relative group flex flex-col items-center flex-shrink-0">
      {/* Outer Mouse-Tilt Container */}
      <div 
        ref={cardRef}
        onClick={handleFlip}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative h-44 w-44 sm:h-48 sm:w-48 flex-shrink-0 cursor-pointer select-none"
        style={{
          perspective: '1000px',
          transform: isHovered ? tiltStyle : 'rotateX(0deg) rotateY(0deg)',
          transition: isHovered ? 'transform 100ms ease-out' : 'transform 400ms ease-out',
        }}
        title="Click to flip artwork"
      >
        {/* Ambient Background Glow Projection */}
        <AlbumArtworkAmbientGlow src={src} />

        {/* Inner 3D Flip Card */}
        <div 
          className="relative h-44 w-44 sm:h-48 sm:w-48 rounded-xl shadow-2xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 950ms cubic-bezier(0.34, 1.25, 0.64, 1)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 25px -5px rgba(99, 102, 241, 0.25)',
          }}
        >
          {/* Front Face Component */}
          <AlbumArtworkFront src={src} alt={alt} />

          {/* Back Face Component */}
          <AlbumArtworkBack src={src} />
        </div>
      </div>
    </div>
  );
}
