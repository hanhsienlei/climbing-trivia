export interface Question {
  id: number;
  question: string;
  category: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation: string;
}
