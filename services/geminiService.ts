import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { QuizData, AudioScript } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateQuizContent = async (): Promise<QuizData> => {
  const prompt = `Create a quiz for a YouTube channel called "Pro" that helps viewers learn English. The quiz must have the following structure:
- A short, engaging title for the quiz.
- Exactly 10 multiple-choice questions. Each question must have 4 choices (A, B, C, D).
- One of the choices must be the correct answer.
- A detailed, clear, and human-like explanation for why the correct answer is right. The explanation should be encouraging and educational.
- A final "homework" question. This should be an open-ended question that requires a short written answer, encouraging viewers to post it in the comments. Provide brief guidance on what the answer should contain.
- The tone should be fun, educational, and professional. Avoid any sensitive topics.
- All content must be in English.
- Do not use any markdown formatting in the output.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                choices: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ["questionText", "choices", "correctAnswerIndex", "explanation"],
            },
          },
          homework: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              guidance: { type: Type.STRING },
            },
            required: ["question", "guidance"],
          },
        },
        required: ["title", "questions", "homework"],
      },
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as QuizData;
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", jsonText);
    throw new Error("Invalid JSON response from Gemini API");
  }
};

const generateSpeech = async (text: string): Promise<string> => {
    try {
        const ttsModel = "gemini-2.5-flash-preview-tts";
        const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text: text }] }],
            config: {
                // FIX: Use Modality.AUDIO enum as per documentation.
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error('No audio data received');
        }
        // FIX: The returned audio is raw PCM data, not webm. Using a more appropriate data URL.
        return `data:audio/pcm;base64,${base64Audio}`;
    } catch (error) {
        console.error(`TTS generation failed for text: "${text}"`, error);
        return ""; // Return empty string on failure
    }
};

const createNarrationScript = (quiz: QuizData): Record<keyof Omit<AudioScript, 'intro' | 'homework' | 'outro'>, string[]> & Record<'intro' | 'homework' | 'outro', string[]> => {
    const questionIntros = [
        "First up, question number one!",
        "Alright, moving on to our second question.",
        "Here is question number three for you.",
        "Let's see how you do with question four.",
        "Halfway there! Here's question five.",
        "Continuing on, question number six.",
        "Question seven is coming right up.",
        "Let's tackle question number eight.",
        "Almost at the end! Here's question nine.",
        "And for the final question, number ten!"
    ];

    const script = {
        intro: ["Welcome to the Pro channel! Today, we have a great quiz to help you master the English language. Let's get started!"],
        questionIntros: quiz.questions.map((_, i) => questionIntros[i]),
        questions: quiz.questions.map(q => `${q.questionText}... Is it A: ${q.choices[0]}, B: ${q.choices[1]}, C: ${q.choices[2]}, or D: ${q.choices[3]}?`),
        answerReveals: quiz.questions.map((q, i) => `Time's up! The correct answer for question ${i+1} is ${q.choices[q.correctAnswerIndex]}.`),
        explanations: quiz.questions.map(q => `Here's why: ${q.explanation}`),
        homework: [`For your homework, think about this: ${quiz.homework.question}. ${quiz.homework.guidance}. Write your answer in the comments below!`],
        outro: ["That's all for today's quiz! How did you do? Let us know your score in the comments. Don't forget to like this video, share it with your friends, and subscribe to the Pro channel for more quizzes. See you tomorrow at 6 PM for another challenge! Thanks for watching!"],
    };

    return script;
};

export const generateQuizAndAudio = async (): Promise<{ quiz: QuizData; audio: AudioScript }> => {
    const quiz = await generateQuizContent();
    const script = createNarrationScript(quiz);

    const allTextToSpeak = [
        ...script.intro,
        ...script.questionIntros,
        ...script.questions,
        ...script.answerReveals,
        ...script.explanations,
        ...script.homework,
        ...script.outro
    ];

    const audioPromises = allTextToSpeak.map(text => generateSpeech(text));
    const audioResults = await Promise.all(audioPromises);

    // FIX: Refactor audio result slicing for clarity and correctness.
    let currentIndex = 0;

    const intro = audioResults[currentIndex];
    currentIndex += script.intro.length;

    const questionIntros = audioResults.slice(currentIndex, currentIndex + script.questionIntros.length);
    currentIndex += script.questionIntros.length;

    const questions = audioResults.slice(currentIndex, currentIndex + script.questions.length);
    currentIndex += script.questions.length;

    const answerReveals = audioResults.slice(currentIndex, currentIndex + script.answerReveals.length);
    currentIndex += script.answerReveals.length;

    const explanations = audioResults.slice(currentIndex, currentIndex + script.explanations.length);
    currentIndex += script.explanations.length;

    const homework = audioResults[currentIndex];
    currentIndex += script.homework.length;

    const outro = audioResults[currentIndex];

    const audioScript: AudioScript = {
        intro,
        questionIntros,
        questions,
        answerReveals,
        explanations,
        homework,
        outro,
    };

    return { quiz, audio: audioScript };
};
