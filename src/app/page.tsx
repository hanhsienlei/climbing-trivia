"use client";

import Link from "next/link";
import { useMemo } from "react";
import allQuestions from "@/data/questions.json";

export default function Home() {
  const categories = useMemo(() => {
    const cats = [...new Set(allQuestions.map((q) => q.category))];
    return cats.sort();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-8 text-center px-6">
        <div className="text-6xl">🧗</div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Rock Climbing Trivia
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Test your knowledge of climbing history, techniques, famous routes, grading systems, and
          more. Get ready for quiz night!
        </p>
        <Link
          href="/quiz"
          className="rounded-full bg-zinc-900 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          All Categories
        </Link>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/quiz?category=${encodeURIComponent(cat)}`}
              className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {cat}
            </Link>
          ))}
        </div>
        <Link
          href="/questions"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          View All Questions
        </Link>
      </main>
    </div>
  );
}
