# Celebration & Event Planner

A deterministic, offline-first celebration and event planning application built with React 18, TypeScript, and Tailwind CSS.

## Chosen Vertical and Persona
This section specifies the target celebration event type and primary user persona navigating budget, vendor, and timeline constraints.
[To be completed in subsequent build phases]

## Approach and Logic
This section details the deterministic calculation engine, allocation algorithms, and dual-engine AI architecture powering the planner.
[To be completed in subsequent build phases]

## How the Solution Works
This section describes the end-to-end user workflow from intake and parameter tuning to schedule generation and export.
[To be completed in subsequent build phases]

## Assumptions Made
This section outlines baseline heuristic constraints, planning assumptions, and domain boundary conditions.
[To be completed in subsequent build phases]

## Getting Started

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm

### Installation and Execution
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Run the automated test suite:
   ```bash
   npm test
   ```
4. Build the production application bundle:
   ```bash
   npm run build
   ```

### Evaluation Note
No API key is required to run, test, or evaluate the application. All core features—including budget allocation, backward timeline generation, vendor checklists, run-of-show schedules, and personalized celebration ideas—run 100% offline out-of-the-box using the deterministic heuristic engine and local idea bank. Live LLM ideation (via Google Gemini) is completely optional and can be enabled at runtime by entering an API key in the application interface (stored transiently in `sessionStorage` with zero persistence).
