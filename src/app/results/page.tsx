"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ScoreSummary from "@/components/ScoreSummary";
import { STORAGE_KEY_RESULT } from "@/lib/quiz";

function getStoredResult(): { score: number; total: number; category: string | null } | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY_RESULT);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY_RESULT);
    return null;
  }
}

export default function ResultsPage() {
  const router = useRouter();
  const result = getStoredResult();

  useEffect(() => {
    if (!result) {
      router.push("/");
    }
  }, [result, router]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <ScoreSummary score={result.score} total={result.total} category={result.category} />
    </div>
  );
}
