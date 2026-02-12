# Climbing Trivia

A Next.js quiz app for rock climbing and bouldering trivia.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest
- **Question Generation:** Anthropic SDK

## Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `npm run dev`           | Start local dev server        |
| `npm run build`         | Production build              |
| `npm start`             | Run production server         |
| `npm run lint`          | Run ESLint                    |
| `npm run type-check`    | TypeScript type checking      |
| `npm test`              | Run unit tests                |
| `npm run test:coverage` | Tests with coverage report    |
| `npm run format`        | Apply Prettier formatting     |
| `npm run format:check`  | Verify formatting only        |
| `npm run generate`      | Generate questions via Claude |

## Project Structure

```
src/
  app/          Routes and pages (/, /quiz, /results, /questions)
  components/   Reusable quiz UI (QuestionCard, Explanation, ScoreSummary)
  lib/          Shared logic (quiz selection, shuffling, constants)
  types.ts      Shared TypeScript interfaces
  data/         Question bank (questions.json)
  __tests__/    Test suite
scripts/
  generate.ts   AI-powered question generation
```

## Question Generation

To generate new trivia questions, set your API key and run the script:

```bash
echo "ANTHROPIC_API_KEY=sk-..." > .env.local
npm run generate
```

This appends new questions to `src/data/questions.json`.
