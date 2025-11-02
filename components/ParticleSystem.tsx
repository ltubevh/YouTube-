
import React from 'react';
import { DiamondIcon, StarIcon, LikeIcon } from './Icons';
import './ParticleSystem.css';

interface ParticleSystemProps {
  particleType: 'diamond' | 'star' | 'like' | null;
  count?: number;
}

const Particle: React.FC<{ type: ParticleSystemProps['particleType'], style: React.CSSProperties }> = ({ type, style }) => {
  const particleMap = {
    diamond: <DiamondIcon className="w-full h-full text-cyan-300" />,
    star: <StarIcon className="w-full h-full text-yellow-300" />,
    like: <LikeIcon className="w-full h-full text-blue-400" />,
  };
  return <div style={style} className="particle">{type && particleMap[type]}</div>;
};

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ particleType, count = 30 }) => {
  if (!particleType) return null;

  const particles = Array.from({ length: count }).map((_, i) => {
    const size = Math.random() * 2 + 1; // 1rem to 3rem
    const style: React.CSSProperties = {
      '--x-start': `${Math.random() * 100}vw`,
      '--x-end': `${Math.random() * 100}vw`,
      '--y-end': `${Math.random() * 100 + 100}vh`,
      '--duration': `${Math.random() * 5 + 5}s`,
      '--delay': `${Math.random() * 5}s`,
      '--rotation-start': `${Math.random() * 360}deg`,
      '--rotation-end': `${Math.random() * 360 + 360}deg`,
       width: `${size}rem`,
       height: `${size}rem`,
    };
    return <Particle key={i} type={particleType} style={style} />;
  });

  return <div className="absolute inset-0 overflow-hidden z-0">{particles}</div>;
};

// Add this CSS to your project, e.g. in a <style> tag in index.html or a global CSS file.
const css = `
@keyframes fall {
  from {
    transform: translateY(-10vh) rotate(var(--rotation-start));
    opacity: 1;
  }
  to {
    transform: translateY(var(--y-end)) rotate(var(--rotation-end));
    opacity: 0;
  }
}
.particle {
  position: absolute;
  top: 0;
  left: var(--x-start);
  animation: fall var(--duration) var(--delay) linear infinite;
  opacity: 0;
  will-change: transform, opacity;
}
`;
// A bit of a hack to inject CSS, but works for single-file component structures.
const styleSheet = document.createElement("style");
styleSheet.innerText = css;
document.head.appendChild(styleSheet);
