
import React, { useEffect } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { LogoPlaceholder } from './LogoPlaceholder';
import { LikeIcon, ShareIcon, SubscribeIcon, BellIcon, CommentIcon } from './Icons';

interface OutroScreenProps {
  audioUrl: string;
  onRestart: () => void;
}

export const OutroScreen: React.FC<OutroScreenProps> = ({ audioUrl, onRestart }) => {
  const { playAudio } = useAudioPlayer(audioUrl);

  useEffect(() => {
    const timer = setTimeout(() => {
        playAudio();
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black animate-fade-in p-8">
      <LogoPlaceholder />
      <h2 className="text-5xl font-bold text-white mt-8" style={{ textShadow: '0 0 15px rgba(0, 150, 255, 0.7)' }}>
        See you tomorrow at 6 PM!
      </h2>
      <p className="text-2xl text-gray-300 mt-4">Don't forget to...</p>
      <div className="flex space-x-8 mt-10">
        <div className="flex flex-col items-center text-lg font-semibold">
          <SubscribeIcon className="w-16 h-16 text-red-600 hover:text-red-500 transition-transform hover:scale-110" />
          <span className="mt-2">SUBSCRIBE</span>
        </div>
        <div className="flex flex-col items-center text-lg font-semibold">
          <LikeIcon className="w-16 h-16 text-blue-500 hover:text-blue-400 transition-transform hover:scale-110" />
          <span className="mt-2">LIKE</span>
        </div>
        <div className="flex flex-col items-center text-lg font-semibold">
          <ShareIcon className="w-16 h-16 text-green-500 hover:text-green-400 transition-transform hover:scale-110" />
          <span className="mt-2">SHARE</span>
        </div>
         <div className="flex flex-col items-center text-lg font-semibold">
          <CommentIcon className="w-16 h-16 text-purple-500 hover:text-purple-400 transition-transform hover:scale-110" />
          <span className="mt-2">COMMENT</span>
        </div>
      </div>
       <button onClick={onRestart} className="mt-12 px-6 py-3 bg-gray-800 border border-gray-600 rounded-lg text-lg hover:bg-gray-700 transition-colors">
        Generate New Quiz
       </button>
    </div>
  );
};
