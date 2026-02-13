# 🧗 Climbing Trivia

A **Next.js trivia web app** for rock climbing and bouldering
enthusiasts.\
Test your knowledge with **200+ curated climbing questions** across
multiple categories.

**Live demo:** <https://climbertrivia.vercel.app/>

---

## Features

- **Interactive Quiz** -- 10 randomly selected questions per session
- **Multiple Choice Format** -- 4 options per question with instant
  feedback
- **Detailed Explanations** -- Each answer includes references for
  learning
- **Score Tracking** -- Review results and revisit answered questions
- **Category Quizzes** -- Focus on specific climbing topics
- **Question Browser** -- Explore the full trivia database anytime

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest + React Testing Library
- **AI Question Generation:** Anthropic SDK (Claude)
- **Code Quality:** ESLint, Prettier, Husky, lint-staged

---

## Getting Started

### Prerequisites

- Node.js 20+

### Install & run locally

```bash
npm install
npm run dev
```

Then open: <http://localhost:3000>

---

## Available Scripts

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

---

## Project Structure

    src/
      app/              Next.js App Router pages
      components/       Reusable UI components
      lib/              Quiz logic and utilities
      data/
        questions.json  Trivia question bank
      types.ts          Shared TypeScript types
    scripts/
      generate.ts       AI-powered question generator

Tests are colocated alongside source files:

    src/**/*.test.ts(x)

---

## Generating New Questions

To generate additional trivia questions using Claude:

```bash
echo "ANTHROPIC_API_KEY=sk-..." > .env.local
npm run generate
```

New questions will:

- Be validated for structure
- Automatically appended to `src/data/questions.json`

---

## Development Guidelines

See **[CLAUDE.md](./CLAUDE.md)** for:

- Coding conventions
- Naming standards
- Architecture patterns
- Project-specific guidance

---

## Future Improvements

- Question Quality: automated fact-checking pipeline before committing generated
  questions
- Testing: add Playwright E2E tests for key flows (eg., Home → Quiz → Results)
- Product Enhancements: persist quiz progress so users can resume sessions

---

## Acknowledgements

Questions are generated with AI assistance and curated for educational
and entertainment purposes.
