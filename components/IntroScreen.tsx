
import React, { useEffect } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { LogoPlaceholder } from './LogoPlaceholder';
import { LikeIcon, ShareIcon, SubscribeIcon, BellIcon, CommentIcon } from './Icons';

interface IntroScreenProps {
  onComplete: () => void;
  audioUrl: string;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, audioUrl }) => {
  const { playAudio } = useAudioPlayer(audioUrl, onComplete);

  useEffect(() => {
    const timer = setTimeout(() => {
        playAudio();
    }, 1000); // Wait 1s before starting
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black animate-fade-in p-8">
      <LogoPlaceholder />
      <h1 className="text-7xl font-extrabold text-white mt-8 tracking-wider" style={{ textShadow: '0 0 15px rgba(0, 150, 255, 0.7)' }}>
        Pro Channel
      </h1>
      <p className="text-3xl text-gray-300 mt-4">New Quiz Every Day at 6 PM!</p>
      <div className="flex space-x-8 mt-12">
        <SubscribeIcon className="w-16 h-16 text-red-600 hover:text-red-500 transition-transform hover:scale-110" />
        <BellIcon className="w-16 h-16 text-gray-400 hover:text-white transition-transform hover:scale-110" />
        <LikeIcon className="w-16 h-16 text-blue-500 hover:text-blue-400 transition-transform hover:scale-110" />
        <ShareIcon className="w-16 h-16 text-green-500 hover:text-green-400 transition-transform hover:scale-110" />
        <CommentIcon className="w-16 h-16 text-purple-500 hover:text-purple-400 transition-transform hover:scale-110" />
      </div>
    </div>
  );
};
