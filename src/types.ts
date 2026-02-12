export interface Question {
  id: number;
  question: string;
  category: string;
  correctAnswer: string;
  wrongAnswers: string[];
  explanation: string;
}
