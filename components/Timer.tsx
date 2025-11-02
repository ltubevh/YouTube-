
import React, { useState, useEffect } from 'react';

interface TimerProps {
  onTimerEnd: () => void;
}

const TOTAL_TIME = 15;
const CIRCLE_RADIUS = 40;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export const Timer: React.FC<TimerProps> = ({ onTimerEnd }) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimerEnd();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimerEnd]);

  const progress = timeLeft / TOTAL_TIME;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  const colorClass =
    timeLeft > 9 ? "text-green-400" : timeLeft > 4 ? "text-yellow-400" : "text-red-500";
  const ringColorClass =
    timeLeft > 9 ? "stroke-green-500" : timeLeft > 4 ? "stroke-yellow-500" : "stroke-red-500";

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-gray-700"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={CIRCLE_RADIUS}
          cx="48"
          cy="48"
        />
        <circle
          className={`${ringColorClass} transition-all duration-1000 ease-linear`}
          strokeWidth="8"
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={CIRCLE_RADIUS}
          cx="48"
          cy="48"
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-4xl font-bold ${colorClass}`}>
        {timeLeft}
      </span>
    </div>
  );
};
