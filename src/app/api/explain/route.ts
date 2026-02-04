import { NextRequest, NextResponse } from "next/server";
import { getExplanation, saveExplanation } from "@/lib/db";
import { generateExplanation } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const { questionId, question, userAnswer, correctAnswer } =
      await request.json();

    if (!questionId || !question || !userAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cached = getExplanation(questionId);
    if (cached) {
      return NextResponse.json({ explanation: cached });
    }

    const explanation = await generateExplanation(
      question,
      userAnswer,
      correctAnswer
    );
    saveExplanation(questionId, explanation);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Error generating explanation:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
