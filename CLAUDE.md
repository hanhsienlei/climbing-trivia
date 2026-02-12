## Development Guidelines

This document contains critical information about working with this codebase. Follow these guidelines precisely.

Product overview, setup commands, and project structure live in `README.md`.

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
| Local `const` values     | camelCase                                        | `const quizSize = 10`               |
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
| Coverage        | Maintain 100% test coverage       | All branches, statements, functions, lines         |

## Architecture

- **Testing:** All components and utilities require co-located tests
- **State:** Use React hooks (`useState`, `useMemo`) for component state; localStorage for persistence
- **Data:** Static JSON for questions (`src/data/questions.json`)
- **Constants:** Define in relevant utility files (e.g., `QUIZ_SIZE` in `src/lib/quiz.ts`)
- **Client-side only:** All quiz logic runs client-side; use `"use client"` directive in components

## Commit Messages

- **Format:** `type: description` (lowercase, imperative mood, no period)
- **Types:** `feat`, `fix`, `test`, `docs`, `refactor`, `chore`
- **Examples:**
  - `feat: add difficulty levels to questions`
  - `fix: handle corrupted localStorage gracefully`
  - `test: add coverage for edge cases in quiz selection`
  - `refactor: extract answer shuffling logic`

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
