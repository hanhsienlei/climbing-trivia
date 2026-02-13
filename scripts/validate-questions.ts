import { readFileSync } from "fs";
import { resolve } from "path";
import type { Category, Question } from "../src/types";
import { CATEGORIES } from "../src/types";

const questionsPath = resolve(__dirname, "../src/data/questions.json");
const questions = JSON.parse(readFileSync(questionsPath, "utf8")) as Question[];

let hasErrors = false;

// Validate categories
const invalidCategories = questions.filter((q) => !CATEGORIES.includes(q.category as Category));

if (invalidCategories.length > 0) {
  console.error(`\n❌ Found ${invalidCategories.length} questions with invalid categories:`);
  invalidCategories.forEach((q) => console.error(`  ID ${q.id}: "${q.category}"`));
  hasErrors = true;
}

// Add more validations here in the future
// Example:
// const missingExplanations = questions.filter((q) => !q.explanation);
// if (missingExplanations.length > 0) { ... }

if (hasErrors) {
  process.exit(1);
}

console.log(`✓ All ${questions.length} questions passed validation`);
