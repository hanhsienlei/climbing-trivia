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
- `npm run format` — apply Prettier formatting
- `npm run format:check` — verify formatting only
- `npm run type-check` — TypeScript type checking
- `npm run test:coverage` — tests with coverage report

## Project Structure

- `src/app/` — Next.js pages (quiz/, results/, questions/)
- `src/components/` — React components (QuestionCard, Explanation, ScoreSummary)
- `src/types.ts` — shared TypeScript interfaces
- `src/lib/` — shared logic (quiz.ts)
- `src/data/questions.json` — trivia question bank
- `src/__tests__/` — test files
- `scripts/` — generation scripts (excluded from tsconfig type-checking)

## Code Style

- TypeScript everywhere — no `any` type, no exceptions
- 2-space indentation
- Components/types/interfaces: PascalCase (`QuestionCard.tsx`)
- Functions/variables: camelCase
- Pages/routes: lowercase directories (`quiz/`, `results/`)
- Test files: kebab-case `<name>.test.ts` in `src/__tests__/`

## Architecture Notes

- New components must have corresponding tests in `src/__tests__/`

## Commit Messages

- Use conventional commits: `type: description` (lowercase)
- Types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`
- Keep subject line short, imperative mood
- No period at the end

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
