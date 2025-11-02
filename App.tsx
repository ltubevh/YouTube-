
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HomeworkScreen } from './components/HomeworkScreen';
import { OutroScreen } from './components/OutroScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { generateQuizAndAudio } from './services/geminiService';
import type { QuizData, AppState, AudioScript } from './types';
import { GameState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    gameState: GameState.Loading,
    quizData: null,
    audioScript: null,
    userAnswers: [],
    currentQuestionIndex: 0,
  });

  const { gameState, quizData, audioScript, userAnswers, currentQuestionIndex } = appState;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { quiz, audio } = await generateQuizAndAudio();
        setAppState(prevState => ({
          ...prevState,
          quizData: quiz,
          audioScript: audio,
          gameState: GameState.Intro,
        }));
      } catch (error) {
        console.error("Failed to generate quiz and audio:", error);
        setAppState(prevState => ({ ...prevState, gameState: GameState.Error }));
      }
    };
    fetchQuiz();
  }, []);

  const handleAnswerSelect = useCallback((choiceIndex: number) => {
    setAppState(prevState => ({
      ...prevState,
      userAnswers: [...prevState.userAnswers, choiceIndex],
    }));
  }, []);

  const handleNext = useCallback(() => {
    setAppState(prevState => {
      const nextIndex = prevState.currentQuestionIndex + 1;
      if (prevState.quizData && nextIndex < prevState.quizData.questions.length) {
        return {
          ...prevState,
          currentQuestionIndex: nextIndex,
          gameState: GameState.Question,
        };
      } else {
        return { ...prevState, gameState: GameState.Results };
      }
    });
  }, []);
  
  const restartQuiz = useCallback(() => {
    window.location.reload();
  }, []);

  const score = useMemo(() => {
    if (!quizData) return 0;
    return userAnswers.reduce((total, answer, index) => {
      if (quizData.questions[index] && answer === quizData.questions[index].correctAnswerIndex) {
        return total + 1;
      }
      return total;
    }, 0);
  }, [userAnswers, quizData]);

  const renderContent = () => {
    if (!quizData || !audioScript) {
      if (gameState === GameState.Error) {
        return <div className="flex items-center justify-center h-screen text-red-500 text-2xl">Failed to load quiz. Please refresh.</div>
      }
      return <LoadingScreen />;
    }

    switch (gameState) {
      case GameState.Intro:
        return <IntroScreen onComplete={() => setAppState(prevState => ({ ...prevState, gameState: GameState.Question }))} audioUrl={audioScript.intro} />;
      case GameState.Question:
        const currentQuestion = quizData.questions[currentQuestionIndex];
        return (
          <QuizScreen
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quizData.questions.length}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            audioScript={{
                questionIntro: audioScript.questionIntros[currentQuestionIndex],
                question: audioScript.questions[currentQuestionIndex],
                answerReveal: audioScript.answerReveals[currentQuestionIndex],
                explanation: audioScript.explanations[currentQuestionIndex]
            }}
          />
        );
      case GameState.Results:
        return <ResultsScreen score={score} totalQuestions={quizData.questions.length} onComplete={() => setAppState(prevState => ({ ...prevState, gameState: GameState.Homework }))} />;
      case GameState.Homework:
        return <HomeworkScreen homework={quizData.homework} audioUrl={audioScript.homework} onComplete={() => setAppState(prevState => ({ ...prevState, gameState: GameState.Outro }))} />;
      case GameState.Outro:
        return <OutroScreen audioUrl={audioScript.outro} onRestart={restartQuiz} />;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <main className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="aspect-[16/9] w-full max-w-full h-full max-h-full bg-black relative">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
