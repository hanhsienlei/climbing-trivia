import { NextResponse } from "next/server";
import { getRandomQuestions, getQuestionCount, saveQuestions } from "@/lib/db";
import { generateQuestions } from "@/lib/claude";

const BATCH_SIZE = 20;
const QUIZ_SIZE = 10;

export async function GET() {
  try {
    const count = getQuestionCount();

    if (count < QUIZ_SIZE) {
      const newQuestions = await generateQuestions(BATCH_SIZE);
      saveQuestions(newQuestions);
    }

    const questions = getRandomQuestions(QUIZ_SIZE);

    const formatted = questions.map((q) => ({
      id: q.id,
      question: q.question,
      correct_answer: q.correct_answer,
      wrong_answers: JSON.parse(q.wrong_answers) as string[],
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
