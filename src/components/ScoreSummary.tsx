"use client";

import Link from "next/link";

interface ScoreSummaryProps {
  score: number;
  total: number;
  category: string | null;
}

export default function ScoreSummary({ score, total, category }: ScoreSummaryProps) {
  const percentage = Math.round((score / total) * 100);

  let message: string;
  if (percentage === 100) message = "Perfect score! You're a climbing encyclopedia!";
  else if (percentage >= 80) message = "Great job! You really know your climbing!";
  else if (percentage >= 60) message = "Not bad! Keep studying for quiz night!";
  else if (percentage >= 40) message = "Room for improvement. Try another round!";
  else message = "Time to hit the books (and the crag)!";

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-6xl">{percentage >= 80 ? "🏆" : percentage >= 50 ? "💪" : "📚"}</div>
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
        {score} / {total}
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">{message}</p>
      <div className="flex gap-4">
        <Link
          href={category ? `/quiz?category=${encodeURIComponent(category)}` : "/quiz"}
          className="rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Play Again
        </Link>
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-6 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
