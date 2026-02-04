"use client";

import { useState } from "react";

interface QuestionCardProps {
  question: string;
  answers: string[];
  correctAnswer: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export default function QuestionCard({
  question,
  answers,
  correctAnswer,
  onAnswer,
  disabled,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(answer: string) {
    if (disabled) return;
    setSelected(answer);
    onAnswer(answer, answer === correctAnswer);
  }

  function getButtonStyle(answer: string) {
    if (!disabled || selected === null) {
      return answer === selected
        ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800"
        : "border-zinc-300 hover:border-zinc-500 dark:border-zinc-600 dark:hover:border-zinc-400";
    }
    if (answer === correctAnswer) {
      return "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400";
    }
    if (answer === selected && answer !== correctAnswer) {
      return "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-300 dark:border-red-400";
    }
    return "border-zinc-200 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600";
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {question}
      </h2>
      <div className="flex flex-col gap-3">
        {answers.map((answer, i) => (
          <button
            key={i}
            onClick={() => handleSelect(answer)}
            disabled={disabled}
            className={`w-full rounded-lg border-2 px-4 py-3 text-left text-base transition-colors ${getButtonStyle(answer)} ${disabled ? "cursor-default" : "cursor-pointer"}`}
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
}
