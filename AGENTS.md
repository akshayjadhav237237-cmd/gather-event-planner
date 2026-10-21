# Engineering Rules & Architecture Guide

## Architecture Summary
- **Type**: Client-only Single Page Application (React 18, Vite, TypeScript, Tailwind CSS).
- **Core Engine**: Pure, deterministic TypeScript calculation engines in `src/domain/`.
- **AI Layer**: Offline-first dual-engine design in `src/ai/` (deterministic heuristic fallback + optional live LLM adapter).
- **Export Suite**: Pure client-side export and backup generators in `src/export/` (CSV, RFC 5545 ICS, Markdown, JSON).

## Directory Structure
- `src/types/`: Central TypeScript interfaces, types, and Zod schemas.
- `src/config/`: Runtime configuration and environment constants.
- `src/data/`: Static templates, baseline heuristic datasets, and reference catalogs.
- `src/domain/`: Pure business logic (budget allocation, timeline, vendor scoring). **MUST NOT import React!**
- `src/ai/`: Offline-first AI services (deterministic generator, live LLM adapter). **MUST NOT import React!**
- `src/export/`: Pure export formatters (CSV, ICS, Markdown, Backup). **MUST NOT import React or touch DOM!**
- `src/store/`: Zustand state store for client application state.
- `src/components/`: Modular, accessible UI components.
- `src/ui/`: Pure view derivation helpers, labels, and browser effect adapters.
- `src/utils/`: Pure utilities (e.g., dateMath, currency formatting, debounce).
- `tests/`: Vitest automated test suites (node unit tests + opt-in jsdom interaction tests in `tests/ui/`).

## Core Engineering Rules
1. **Purity & Time Determinism**: Engines in `src/domain/`, `src/export/`, and `src/data/` are pure functions and data structures. Never import React or touch DOM, `window`, `localStorage`, `Date.now()`, `new Date()`, or `Math.random()`. Time-dependent functions accept explicit ISO date/time parameters.
2. **Integer Currency Math**: All monetary amounts are integers in major units. Rounding must use the largest-remainder method so that category sums plus contingency strictly equal the total budget.
3. **Modularity & File Length**: Maximum file size is strictly 220 lines across all code, CSS, and test files.
4. **Code Quality Zero Tolerance**: No `any` types, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `console.*`, `eval`, `new Function`, `dangerouslySetInnerHTML`, or `.innerHTML`.
5. **No Fabrication**: Never invent real-world vendor names, prices, phone numbers, addresses, URLs, or legal statutes.
6. **Compliance & Safety**: Compliance and safety guidance must remain generic ("confirm local requirements"). Never assert specific statutory codes or regulatory bodies (no ADA, CPSC, AAP, FDA, OSHA, etc.).
7. **Explicit Heuristics**: Planning guidelines (budget splits, per-guest floors, ratios) must always be placed in named constants labeled as "planning heuristics", never presented as verified facts.
8. **Safe AI Rendering**: Render all AI-generated content as escaped plain text only (no raw HTML rendering).
9. **Zero Committed Secrets**: API keys live strictly in `sessionStorage` under `API_KEY_SESSION_KEY`. Never persist or commit secrets.
10. **Branch & Commit Hygiene**: Work exclusively on `master` (single branch). Follow conventional commit prefixes.
11. **Verification Gate**: Before declaring any task complete, verify exit code 0 on:
    - `npm run typecheck`
    - `npm run lint`
    - `npm test`
    - `npm run build`

## UI, Export & Print Conventions
- **Tokens Only**: Styles use design tokens from CSS variables (`var(--color-*)`); zero hex literals in `.tsx`.
- **Static Classes Only**: Class names must be static strings; dynamic styles use static lookup dictionaries.
- **Native Elements First**: Interactive controls use native HTML (`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`) with visible focus rings (`:focus-visible`) and bound labels.
- **Browser DOM Isolation**: DOM and browser side-effects (Blob, `URL.createObjectURL`, `navigator.clipboard`, `window.print`, file reading) live strictly in `src/ui/browserActions.ts`.
- **Print Layout**: `PrintBrief` is styled for `@media print` with black-on-white text, semantic captions, `<h2>` document title (zero `<h1>`), and page-break controls.
- **Backup & Restore**: Enforces 1 MB payload limits, prototype pollution rejection (`__proto__`, `constructor`, `prototype`), and strict Zod schema validation.
- **Interaction Testing**: UI interaction tests in `tests/ui/*.test.tsx` opt in to `jsdom` via `// @vitest-environment jsdom` and use `@testing-library/react` and `@testing-library/user-event`.
- **Continuous Integration**: `.github/workflows/ci.yml` runs full validation (`npm ci`, `typecheck`, `lint`, `test`, `build`) on Node 20 for push and PR on `master`.
