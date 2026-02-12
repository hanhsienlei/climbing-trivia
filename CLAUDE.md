## Project Overview

Climbing Trivia — a Next.js quiz app about rock climbing.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Vitest for testing
- Question generation via Anthropic SDK (`tsx scripts/generate.ts`)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm test` — run Vitest tests
- `npm run generate` — generate trivia questions with Claude

## Project Structure

- `src/app/` — Next.js pages (quiz/, results/, questions/)
- `src/components/` — React components (QuestionCard, Explanation, ScoreSummary)
- `src/data/questions.json` — trivia question bank
- `src/__tests__/` — test files
- `scripts/` — generation scripts

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
