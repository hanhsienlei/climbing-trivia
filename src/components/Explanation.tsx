"use client";

interface ExplanationProps {
  explanation: string | null;
  loading: boolean;
}

export default function Explanation({ explanation, loading }: ExplanationProps) {
  if (loading) {
    return (
      <div className="mt-4 w-full max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-amber-800 dark:text-amber-300">
          Loading explanation...
        </p>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="mt-4 w-full max-w-2xl rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <p className="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
        Explanation
      </p>
      <p className="text-blue-800 dark:text-blue-200">{explanation}</p>
    </div>
  );
}
