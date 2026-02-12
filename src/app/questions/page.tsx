"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import allQuestions from "@/data/questions.json";

export default function QuestionsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = [...new Set(allQuestions.map((q) => q.category))];
    return cats.sort();
  }, []);

  const filtered =
    selectedCategory === "all"
      ? allQuestions
      : allQuestions.filter((q) => q.category === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            All Questions ({filtered.length})
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Back to Home
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((q, index) => (
            <div
              key={q.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="w-full text-left cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-sm font-mono text-zinc-400 dark:text-zinc-500">
                    {index + 1}.
                  </span>
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {q.question}
                    </span>
                    <span className="ml-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-xs capitalize text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {q.category}
                    </span>
                  </div>
                </div>
              </button>

              {expandedId === q.id && (
                <div className="mt-4 ml-8 flex flex-col gap-2">
                  <p className="text-sm">
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      Answer:{" "}
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200">{q.correctAnswer}</span>
                  </p>
                  <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
