"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScoreSummary from "@/components/ScoreSummary";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    null
  );

  useEffect(() => {
    const stored = localStorage.getItem("quizResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <ScoreSummary score={result.score} total={result.total} />
    </div>
  );
}
