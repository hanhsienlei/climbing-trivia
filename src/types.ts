export const CATEGORIES = [
  "Bouldering",
  "Rope Climbing",
  "General Knowledge",
  "Competition",
  "Australia",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Question {
  id: number;
  question: string;
  category: Category;
  correctAnswer: string;
  wrongAnswers: string[];
  explanation: string;
  references: string[];
}
