
import React, { useEffect } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Typewriter } from './Typewriter';

interface HomeworkScreenProps {
  homework: {
    question: string;
    guidance: string;
  };
  audioUrl: string;
  onComplete: () => void;
}

export const HomeworkScreen: React.FC<HomeworkScreenProps> = ({ homework, audioUrl, onComplete }) => {
  const { playAudio, isPlaying } = useAudioPlayer(audioUrl, onComplete);

  useEffect(() => {
    const timer = setTimeout(() => {
        playAudio();
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 animate-fade-in">
      <h1 className="text-6xl font-bold mb-8 text-purple-400" style={{ textShadow: '0 0 15px rgba(192, 132, 252, 0.6)'}}>
        Homework Time!
      </h1>
      <div className={`text-4xl font-medium my-4 max-w-5xl leading-relaxed transition-colors duration-300 ${isPlaying ? 'text-yellow-300' : 'text-white'}`}>
        <Typewriter text={homework.question} />
      </div>
      <p className="text-2xl text-gray-400 mt-6 max-w-4xl">
        {homework.guidance}
      </p>
      <p className="mt-12 text-3xl font-semibold animate-pulse">
        ✏️ Share your answer in the comments below! 👇
      </p>
    </div>
  );
};
