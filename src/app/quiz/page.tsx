"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import Explanation from "@/components/Explanation";
import allQuestions from "@/data/questions.json";

interface Question {
  id: number;
  question: string;
  category: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const QUIZ_SIZE = 10;

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const questions = useMemo(() => {
    const pool = category
      ? (allQuestions as Question[]).filter((q) => q.category === category)
      : (allQuestions as Question[]);
    return shuffleArray(pool).slice(0, QUIZ_SIZE);
  }, [category]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (currentIndex < questions.length) {
      const q = questions[currentIndex];
      setShuffledAnswers(shuffleArray([q.correct_answer, ...q.wrong_answers]));
    }
  }, [questions, currentIndex]);

  function handleAnswer(answer: string, isCorrect: boolean) {
    setAnswered(true);
    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setExplanation(questions[currentIndex].explanation);
    }
  }

  function handleNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      localStorage.setItem(
        "quizResult",
        JSON.stringify({ score: score, total: questions.length })
      );
      router.push("/results");
    } else {
      setCurrentIndex(nextIndex);
      setAnswered(false);
      setExplanation(null);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            No questions found{category ? ` for "${category}"` : ""}.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-full bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mb-8 flex w-full max-w-2xl items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Question {currentIndex + 1} of {questions.length}
          {category && (
            <span className="ml-2 rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-700">
              {category}
            </span>
          )}
        </span>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Score: {score}
        </span>
        <button
          onClick={() => router.push("/")}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
        >
          Quit
        </button>
      </div>

      <QuestionCard
        question={currentQuestion.question}
        answers={shuffledAnswers}
        correctAnswer={currentQuestion.correct_answer}
        onAnswer={handleAnswer}
        disabled={answered}
      />

      <Explanation explanation={explanation} loading={false} />

      {answered && (
        <button
          onClick={handleNext}
          className="mt-6 rounded-full bg-zinc-900 px-8 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
        </button>
      )}
    </div>
  );
}
