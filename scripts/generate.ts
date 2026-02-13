import { config } from "dotenv";
config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { Question } from "../src/types";
import { CATEGORIES } from "../src/types";

const OUTPUT_PATH = resolve(__dirname, "../src/data/questions.json");
const BATCH_SIZE = 20;
const TOTAL_QUESTIONS = 50;
const MAX_RETRIES = 3;

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateQuestion(q: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof q !== "object" || q === null) {
    return { isValid: false, errors: ["Not an object"] };
  }

  const obj = q as Record<string, unknown>;

  if (typeof obj.question !== "string" || obj.question.trim() === "") {
    errors.push("Missing or empty question");
  }

  if (
    typeof obj.category !== "string" ||
    !CATEGORIES.includes(obj.category as (typeof CATEGORIES)[number])
  ) {
    errors.push(`Invalid category: "${String(obj.category)}"`);
  }

  if (typeof obj.correctAnswer !== "string" || obj.correctAnswer.trim() === "") {
    errors.push("Missing or empty correctAnswer");
  }

  if (!Array.isArray(obj.wrongAnswers) || obj.wrongAnswers.length !== 3) {
    errors.push(
      `wrongAnswers must be an array of 3 (got ${Array.isArray(obj.wrongAnswers) ? obj.wrongAnswers.length : typeof obj.wrongAnswers})`,
    );
  } else {
    for (let i = 0; i < obj.wrongAnswers.length; i++) {
      if (
        typeof obj.wrongAnswers[i] !== "string" ||
        (obj.wrongAnswers[i] as string).trim() === ""
      ) {
        errors.push(`wrongAnswers[${i}] is missing or empty`);
      }
    }

    const uniqueWrong = new Set(obj.wrongAnswers as string[]);
    if (uniqueWrong.size !== 3) {
      errors.push("wrongAnswers contains duplicates");
    }

    if (typeof obj.correctAnswer === "string" && uniqueWrong.has(obj.correctAnswer)) {
      errors.push("correctAnswer appears in wrongAnswers");
    }
  }

  if (typeof obj.explanation !== "string" || obj.explanation.trim() === "") {
    errors.push("Missing or empty explanation");
  }

  return { isValid: errors.length === 0, errors };
}

async function generateBatch(
  client: Anthropic,
  count: number,
  existingQuestions: string[],
): Promise<unknown[]> {
  const avoidList =
    existingQuestions.length > 0
      ? `\n\nDo NOT repeat any of these existing questions:\n${existingQuestions.map((q) => `- ${q}`).join("\n")}`
      : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Generate ${count} multiple-choice trivia questions about rock climbing and bouldering, with a strong focus on the Australian climbing community. Do NOT include any questions about ice climbing or mountaineering.

Cover a mix of these topics:
- Australian climbing areas (Arapiles, Grampians/Gariwerd, Blue Mountains, Nowra, Moonarie, Frog Buttress, Porongurup, etc.)
- Famous Australian climbers (e.g. HB Lincoln, Malcolm Matheson, Lee Cossey, Monique Forestier, Oceana Mackenzie)
- Australian climbing history and first ascents
- Bouldering culture, famous boulder problems in Australia and worldwide
- Grading systems (V-scale, Ewbank, Fontainebleau, French sport grades)
- Climbing techniques, movement, and training
- Gear and equipment (sport, trad, bouldering)
- International competitions (IFSC, Olympics) including Australian competitors
- Climbing ethics, bolting ethics, and access issues in Australia
- General rock climbing and bouldering trivia (sport, trad, bouldering, deep water solo)
- Famous routes and boulder problems worldwide

Each question must be assigned one of these ${CATEGORIES.length} categories: ${CATEGORIES.map((c) => `"${c}"`).join(", ")}. Distribute questions roughly evenly across all ${CATEGORIES.length} categories.

Each question should have exactly 1 correct answer and 3 plausible but incorrect answers. Make the questions challenging but fair — suitable for a pub quiz night at a climbing gym.

For each question, also include a brief explanation (2-3 sentences) of why the correct answer is right. Include an interesting fact if possible.${avoidList}

Respond with ONLY a JSON array, no other text. Each element should have this shape:
{
  "question": "the question text",
  "category": "one of: ${CATEGORIES.join(", ")}",
  "correctAnswer": "the correct answer",
  "wrongAnswers": ["wrong1", "wrong2", "wrong3"],
  "explanation": "brief explanation of the correct answer"
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse questions from Claude response");
  }
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const client = new Anthropic();

  // Load existing questions if any
  let existing: Question[] = [];
  if (existsSync(OUTPUT_PATH)) {
    existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
    console.log(`Found ${existing.length} existing questions.`);
  }

  const existingTexts = existing.map((q) => q.question);
  let nextId = existing.length > 0 ? Math.max(...existing.map((q) => q.id)) + 1 : 1;
  const allQuestions = [...existing];
  const remaining = TOTAL_QUESTIONS - existing.length;

  if (remaining <= 0) {
    console.log(`Already have ${existing.length} questions. Nothing to generate.`);
    console.log(`Delete src/data/questions.json to regenerate.`);
    return;
  }

  console.log(`Generating ${remaining} new questions...`);

  let generated = 0;
  let retries = 0;
  while (generated < remaining) {
    const batchSize = Math.min(BATCH_SIZE, remaining - generated);
    console.log(`  Generating batch of ${batchSize}...`);

    const batch = await generateBatch(client, batchSize, existingTexts);

    let validCount = 0;
    for (const q of batch) {
      const { isValid, errors } = validateQuestion(q);
      if (!isValid) {
        console.warn(`  Skipping invalid question: ${errors.join("; ")}`);
        continue;
      }

      const typed = q as Omit<Question, "id">;
      allQuestions.push({
        id: nextId++,
        question: typed.question,
        category: typed.category,
        correctAnswer: typed.correctAnswer,
        wrongAnswers: typed.wrongAnswers,
        explanation: typed.explanation,
      });
      existingTexts.push(typed.question);
      validCount++;
    }

    generated += validCount;
    console.log(
      `  Got ${validCount}/${batch.length} valid questions. Total: ${allQuestions.length}`,
    );

    if (validCount === 0) {
      retries++;
      if (retries >= MAX_RETRIES) {
        console.error(
          `  Failed to get valid questions after ${MAX_RETRIES} consecutive retries. Stopping.`,
        );
        break;
      }
      console.warn(`  No valid questions in batch. Retrying (${retries}/${MAX_RETRIES})...`);
    } else {
      retries = 0;
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(allQuestions, null, 2));
  console.log(`\nWrote ${allQuestions.length} questions to src/data/questions.json`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
