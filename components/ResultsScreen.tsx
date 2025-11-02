
import React, { useEffect, useMemo } from 'react';
import { ParticleSystem } from './ParticleSystem';

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  onComplete: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, totalQuestions, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const feedback = useMemo(() => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage === 100) return { title: "EXCELLENT!", particle: "diamond", color: "text-yellow-300" };
    if (percentage >= 90) return { title: "GREAT!", particle: "star", color: "text-yellow-400" };
    if (percentage >= 80) return { title: "GOOD!", particle: "like", color: "text-blue-400" };
    return { title: "NICE TRY!", particle: null, color: "text-white" };
  }, [score, totalQuestions]);

  const encouragingMessage = `Keep practicing and you'll be an expert in no time. Subscribe for more daily quizzes to boost your skills!`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in relative overflow-hidden">
      {feedback.particle && <ParticleSystem particleType={feedback.particle} />}
      <h1 className="text-5xl font-bold text-gray-400 mb-4 animate-slide-in-down">Quiz Complete!</h1>
      <h2 className={`text-9xl font-extrabold my-4 animate-zoom-in ${feedback.color}`} style={{ textShadow: '0 0 20px currentColor' }}>
        {feedback.title}
      </h2>
      <p className="text-6xl font-semibold my-6 animate-slide-in-up">
        You scored <span className="text-green-400">{score}</span> out of <span className="text-green-400">{totalQuestions}</span>
      </p>
      {feedback.particle === null && (
        <p className="text-2xl text-gray-300 max-w-3xl mt-4 animate-fade-in delay-1000">
            {encouragingMessage}
        </p>
      )}
    </div>
  );
};
