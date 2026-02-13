import { readFileSync } from "fs";
import { resolve } from "path";
import type { Category, Question } from "../src/types";
import { CATEGORIES } from "../src/types";

const questionsPath = resolve(__dirname, "../src/data/questions.json");
const questions = JSON.parse(readFileSync(questionsPath, "utf8")) as Question[];

let hasErrors = false;

// 1. Validate ID uniqueness
const ids = questions.map((q) => q.id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  console.error(`\n❌ Found duplicate question IDs: ${[...new Set(duplicateIds)].join(", ")}`);
  hasErrors = true;
}

// 2. Validate categories
const invalidCategories = questions.filter((q) => !CATEGORIES.includes(q.category as Category));
if (invalidCategories.length > 0) {
  console.error(`\n❌ Found ${invalidCategories.length} questions with invalid categories:`);
  invalidCategories.forEach((q) => console.error(`  ID ${q.id}: "${q.category}"`));
  hasErrors = true;
}

// 3. Validate wrongAnswers array length
const invalidAnswerCount = questions.filter((q) => q.wrongAnswers.length !== 3);
if (invalidAnswerCount.length > 0) {
  console.error(
    `\n❌ Found ${invalidAnswerCount.length} questions without exactly 3 wrong answers:`,
  );
  invalidAnswerCount.forEach((q) =>
    console.error(`  ID ${q.id}: has ${q.wrongAnswers.length} wrong answers`),
  );
  hasErrors = true;
}

// 4. Validate correctAnswer is not in wrongAnswers
const correctInWrong = questions.filter((q) => q.wrongAnswers.includes(q.correctAnswer));
if (correctInWrong.length > 0) {
  console.error(
    `\n❌ Found ${correctInWrong.length} questions where correctAnswer appears in wrongAnswers:`,
  );
  correctInWrong.forEach((q) => console.error(`  ID ${q.id}: "${q.correctAnswer}"`));
  hasErrors = true;
}

// 5. Validate all answers are unique
const duplicateAnswers = questions.filter((q) => {
  const allAnswers = [q.correctAnswer, ...q.wrongAnswers];
  return new Set(allAnswers).size !== 4;
});
if (duplicateAnswers.length > 0) {
  console.error(`\n❌ Found ${duplicateAnswers.length} questions with duplicate answers:`);
  duplicateAnswers.forEach((q) => console.error(`  ID ${q.id}`));
  hasErrors = true;
}

// 6. Validate non-empty fields
const emptyFields = questions.filter(
  (q) =>
    !q.question.trim() ||
    !q.correctAnswer.trim() ||
    !q.explanation.trim() ||
    q.wrongAnswers.some((a) => !a.trim()),
);
if (emptyFields.length > 0) {
  console.error(`\n❌ Found ${emptyFields.length} questions with empty fields:`);
  emptyFields.forEach((q) => console.error(`  ID ${q.id}`));
  hasErrors = true;
}

if (hasErrors) {
  process.exit(1);
}

console.log(`✓ All ${questions.length} questions passed validation`);
