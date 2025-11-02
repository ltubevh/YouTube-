
import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white z-50">
      <div className="w-24 h-24 border-4 border-t-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-6 text-2xl font-semibold animate-pulse">Generating Your Quiz...</p>
      <p className="mt-2 text-lg text-gray-400">Please wait, this may take a moment.</p>
    </div>
  );
};
