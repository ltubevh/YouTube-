
export interface Question {
  questionText: string;
  choices: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: Question[];
  homework: {
    question: string;
    guidance: string;
  };
}

export enum GameState {
  Loading,
  Error,
  Intro,
  Question,
  Results,
  Homework,
  Outro,
}

export interface AudioScript {
  intro: string;
  questionIntros: string[];
  questions: string[];
  answerReveals: string[];
  explanations: string[];
  homework: string;
  outro: string;
}

export interface AppState {
  gameState: GameState;
  quizData: QuizData | null;
  audioScript: AudioScript | null;
  userAnswers: number[];
  currentQuestionIndex: number;
}
