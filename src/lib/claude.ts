import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface GeneratedQuestion {
  question: string;
  correct_answer: string;
  wrong_answers: string[];
}

export async function generateQuestions(count: number): Promise<GeneratedQuestion[]> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Generate ${count} multiple-choice trivia questions about rock climbing and bouldering. Cover a mix of topics: climbing history, famous climbers, grading systems (V-scale, Fontainebleau, YDS, French sport grades), techniques, gear, famous routes and boulder problems, competitions (IFSC, Olympics), safety, climbing types (sport, trad, bouldering, deep water solo), climbing ethics, and notable climbing locations worldwide.

Each question should have exactly 1 correct answer and 3 plausible but incorrect answers. Make the questions challenging but fair — suitable for a pub quiz night.

Respond with ONLY a JSON array, no other text. Each element should have this shape:
{
  "question": "the question text",
  "correct_answer": "the correct answer",
  "wrong_answers": ["wrong1", "wrong2", "wrong3"]
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse questions from Claude response");
  }
  return JSON.parse(jsonMatch[0]) as GeneratedQuestion[];
}

export async function generateExplanation(
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Rock climbing trivia question: "${question}"

The user answered: "${userAnswer}"
The correct answer is: "${correctAnswer}"

Give a brief, informative explanation (2-3 sentences) of why the correct answer is right. Include an interesting fact if possible. Keep it concise and educational.`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "No explanation available.";
}
