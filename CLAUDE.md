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
- `scripts/` — generation scripts (excluded from tsconfig type-checking)

## Code Style

- TypeScript everywhere — no `any` type, no exceptions
- 2-space indentation

### Naming Conventions

| Construct                | Convention                                       | Example                             |
| ------------------------ | ------------------------------------------------ | ----------------------------------- |
| Components (name + file) | PascalCase                                       | `QuestionCard` / `QuestionCard.tsx` |
| Hooks (name + file)      | camelCase, `use` prefix                          | `useQuiz` / `useQuiz.ts`            |
| Utility files            | camelCase                                        | `quiz.ts`, `formatDate.ts`          |
| Type/Interface files     | camelCase                                        | `types.ts`                          |
| Directories              | lowercase / kebab-case                           | `components/`, `lib/`               |
| Route files              | Next.js mandated                                 | `page.tsx`, `layout.tsx`            |
| Interfaces/Types         | PascalCase, no `I` prefix                        | `Question`, `QuestionCardProps`     |
| Props interfaces         | PascalCase + `Props` suffix                      | `ScoreSummaryProps`                 |
| Functions/variables      | camelCase                                        | `shuffleArray`, `currentIndex`      |
| Module-level constants   | CONSTANT_CASE                                    | `QUIZ_SIZE`, `STORAGE_KEY_RESULT`   |
| Local `const` values     | camelCase                                        | `const quizSize = 5`                |
| Object properties        | camelCase                                        | `correctAnswer`, `wrongAnswers`     |
| Event handler props      | `on` prefix                                      | `onAnswer`, `onClick`               |
| Event handler impl       | `handle` prefix                                  | `handleAnswer`, `handleNext`        |
| Boolean vars/props       | `is`/`has`/`should` prefix where it aids clarity | `isCorrect`, `hasError`             |
| Abbreviations            | Treat as whole words                             | `loadHttpUrl` not `loadHTTPURL`     |
| Enums                    | PascalCase name, CONSTANT_CASE values            | `enum Color { RED, BLUE }`          |

### Test Conventions

| Convention      | Rule                              | Example                                            |
| --------------- | --------------------------------- | -------------------------------------------------- |
| File naming     | Match source file + `.test.ts(x)` | `quiz.test.ts` for `quiz.ts`                       |
| Location        | Co-located next to source file    | `src/lib/quiz.test.ts` next to `src/lib/quiz.ts`   |
| Component tests | PascalCase matching component     | `QuestionCard.test.tsx` next to `QuestionCard.tsx` |

## Architecture Notes

- New components must have corresponding co-located tests

## Commit Messages

- Use conventional commits: `type: description` (lowercase)
- Types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`
- Keep subject line short, imperative mood
- No period at the end

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
