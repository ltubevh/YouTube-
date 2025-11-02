
import React from 'react';

export const LogoPlaceholder: React.FC = () => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gray-900 border-4 border-blue-500 animate-pulse-glow"></div>
      <div className="absolute inset-0 rounded-full border-4 border-blue-400" style={{ animation: 'spin 20s linear infinite' }}></div>
      <span className="text-gray-500 text-2xl font-semibold z-10">LOGO</span>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 35px 15px rgba(59, 130, 246, 0.7); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
