# Engineering Rules & Architecture Guide

## Architecture Summary
- **Type**: Client-only Single Page Application (React 18, Vite, TypeScript, Tailwind CSS).
- **Core Engine**: Pure, deterministic TypeScript calculation engines in `src/domain/`.
- **AI Layer**: Offline-first dual-engine design in `src/services/ai/` (deterministic heuristic fallback + optional live LLM adapter).

## Directory Structure
- `src/types/`: Central TypeScript interfaces, types, and Zod schemas.
- `src/config/`: Runtime configuration and environment constants.
- `src/data/`: Static templates, baseline heuristic datasets, and reference catalogs.
- `src/domain/`: Pure business logic (budget allocation, timeline generation, vendor scoring). **MUST NOT import React!**
- `src/services/`: AI services (deterministic generator, live LLM adapter) and storage. **MUST NOT import React!**
- `src/store/`: Zustand state store for client application state.
- `src/components/`: Modular, accessible UI components.
- `src/utils/`: Pure utilities (e.g., dateMath, currency formatting, debounce).
- `tests/`: Vitest automated test suites.

## Core Engineering Rules
1. **Purity & Time Determinism**: Engines in `src/domain/` are pure functions that accept `today` as an explicit parameter. Never read the system clock (`Date.now()`, `new Date()`) directly inside domain calculations.
2. **Integer Currency Math**: All monetary amounts are integers in major units. Rounding must use the largest-remainder method so that category sums plus contingency strictly equal the total budget.
3. **Modularity & File Length**: Maximum file size is strictly 220 lines. Keep code modular, decomposed, and focused.
4. **Code Quality Zero Tolerance**:
   - No `any` types.
   - No `@ts-ignore` or `@ts-expect-error`.
   - No `eslint-disable` comments.
   - No `console.log` statements.
   - No `dangerouslySetInnerHTML`, `.innerHTML`, `eval`, or `new Function`.
5. **No Fabrication**: Never invent real-world vendor names, prices, phone numbers, addresses, or legal statutes.
6. **Compliance & Safety**: Compliance and safety guidance must remain generic (e.g., "verify local requirements") and never assert specific statutory codes without authoritative citation.
7. **Explicit Heuristics**: Planning guidelines (budget splits, per-guest floors) must always be explicitly labeled as "planning heuristics", never presented as absolute facts.
8. **Safe AI Rendering**: Render all AI-generated content as escaped plain text only (no raw HTML rendering).
9. **Zero Committed Secrets**: API keys live strictly in `sessionStorage` under `API_KEY_SESSION_KEY`. Never persist or commit secrets.
10. **Branch & Commit Hygiene**: Commit messages follow conventional formats (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Work exclusively on the current single branch; do not switch or create branches.
11. **Verification Gate**: Before declaring any task complete, verify that the following commands all exit with status code 0:
    - `npm run typecheck`
    - `npm run lint`
    - `npm test`
    - `npm run build`
