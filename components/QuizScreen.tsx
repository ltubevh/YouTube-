import React, { useState, useEffect, useCallback } from 'react';
import type { Question } from '../types';
import { Timer } from './Timer';
import { Typewriter } from './Typewriter';
import { ParticleSystem } from './ParticleSystem';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface QuizScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (choiceIndex: number) => void;
  onNext: () => void;
  audioScript: {
    questionIntro: string;
    question: string;
    answerReveal: string;
    explanation: string;
  };
}

type QuizPhase = 'intro' | 'asking' | 'timing' | 'revealing' | 'explaining' | 'finished';

// FIX: Add `totalQuestions` to destructured props.
export const QuizScreen: React.FC<QuizScreenProps> = ({ question, questionNumber, totalQuestions, onAnswerSelect, onNext, audioScript }) => {
  const [phase, setPhase] = useState<QuizPhase>('intro');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  
  const { playAudio: playIntro, isPlaying: isIntroPlaying } = useAudioPlayer(audioScript.questionIntro, () => setPhase('asking'));
  const { playAudio: playQuestion, isPlaying: isQuestionPlaying } = useAudioPlayer(audioScript.question, () => setPhase('timing'));
  const { playAudio: playReveal, isPlaying: isRevealPlaying } = useAudioPlayer(audioScript.answerReveal, () => setPhase('explaining'));
  const { playAudio: playExplanation, isPlaying: isExplanationPlaying } = useAudioPlayer(audioScript.explanation, () => setPhase('finished'));

  useEffect(() => {
    playIntro();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.questionText]);

  useEffect(() => {
    if (phase === 'asking' && !isQuestionPlaying) playAudio();
    if (phase === 'revealing' && !isRevealPlaying) {
      setShowParticles(true);
      playReveal();
    }
    if (phase === 'explaining' && !isExplanationPlaying) playExplanation();
    if (phase === 'finished' && !isExplanationPlaying) {
        const timer = setTimeout(onNext, 2000);
        return () => clearTimeout(timer);
    }
  }, [phase, isQuestionPlaying, isRevealPlaying, isExplanationPlaying, playQuestion, playReveal, playExplanation, onNext]);

  const handleTimerEnd = useCallback(() => {
    const answer = selectedAnswer ?? -1; // -1 if no answer
    onAnswerSelect(answer);
    setPhase('revealing');
  }, [selectedAnswer, onAnswerSelect]);

  const handleChoiceClick = (index: number) => {
    if (phase === 'timing') {
      setSelectedAnswer(index);
    }
  };

  const getChoiceClass = (index: number) => {
    let baseClass = "w-full border-2 rounded-lg p-4 text-left text-2xl transition-all duration-500 transform";
    if (phase === 'revealing' || phase === 'explaining' || phase === 'finished') {
      if (index === question.correctAnswerIndex) {
        return `${baseClass} border-green-500 bg-green-500/50 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.8)]`;
      }
      if (index === selectedAnswer) {
        return `${baseClass} border-red-500 bg-red-500/30`;
      }
      return `${baseClass} border-gray-600 bg-gray-800/50 opacity-50`;
    }
    if (phase === 'timing') {
      return `${baseClass} border-blue-500 bg-blue-500/10 hover:bg-blue-500/30 hover:scale-105 ${selectedAnswer === index ? 'border-yellow-400 bg-yellow-400/20' : ''}`;
    }
    return `${baseClass} border-gray-700 bg-gray-900/50`;
  };
  
  const isTextHighlighted = (currentPhase: QuizPhase) => isIntroPlaying && currentPhase === 'intro' || isQuestionPlaying && currentPhase === 'asking' || isRevealPlaying && currentPhase === 'revealing' || isExplanationPlaying && currentPhase === 'explaining'

  return (
    <div className="w-full h-full flex flex-col justify-between p-12 animate-fade-in relative overflow-hidden">
      {showParticles && <ParticleSystem particleType="diamond" />}
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
          {phase === 'intro' && isIntroPlaying ? <span className="text-yellow-300">{`Question ${questionNumber}`}</span> : `Question ${questionNumber}`}
        </h2>
        {phase === 'timing' && <Timer onTimerEnd={handleTimerEnd} />}
        <h2 className="text-4xl font-bold text-gray-500">{questionNumber} / {totalQuestions}</h2>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center text-center -mt-16">
        <div className={`text-4xl font-semibold mb-12 leading-relaxed transition-colors duration-300 ${isTextHighlighted('asking') || isTextHighlighted('intro') ? 'text-yellow-300' : 'text-white'}`}>
          { (phase === 'asking' || phase === 'timing' || phase === 'revealing' || phase === 'explaining' || phase === 'finished') && <Typewriter text={question.questionText} /> }
        </div>

        { (phase === 'asking' || phase === 'timing' || phase === 'revealing' || phase === 'explaining' || phase === 'finished') && (
            <div className="grid grid-cols-2 gap-6 w-full max-w-6xl">
              {question.choices.map((choice, index) => (
                <button key={index} className={getChoiceClass(index)} onClick={() => handleChoiceClick(index)} disabled={phase !== 'timing'}>
                  <span className="font-bold mr-4">{String.fromCharCode(65 + index)}</span>
                  {choice}
                </button>
              ))}
            </div>
        )}

        { (phase === 'explaining' || phase === 'finished') && (
          <div className={`mt-12 p-6 rounded-lg bg-black/50 backdrop-blur-sm border border-gray-700 max-w-5xl transition-colors duration-300 ${isTextHighlighted('explaining') ? 'text-yellow-300' : 'text-white'}`}>
             <Typewriter text={question.explanation} />
          </div>
        )}
      </div>
      <div></div>
    </div>
  );
};
