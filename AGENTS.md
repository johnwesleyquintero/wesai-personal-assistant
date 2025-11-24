# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Lint/Run Commands
- **Custom Code Checker**: This project utilizes a custom code checker defined in [`scripts/code-checker.mjs`](scripts/code-checker.mjs) and configured by [`scripts/code-checks.config.mjs`](scripts/code-checks.config.mjs). This runs alongside standard linting and may enforce specific project-defined rules not covered by ESLint.

## Code Style Rules
- This project adheres to standard ESLint and Prettier configurations. There are no additional project-specific code style rules beyond these tools.

## Custom Utilities or Patterns
- **Environment Variables**: Environment variables are managed centrally through [`utils/env.ts`](utils/env.ts), providing a single source of truth for configuration.
- **API Service Interaction**: Interactions with the Gemini API (and potentially other external services) are encapsulated within `services/*` files, specifically following patterns established in [`services/geminiService.ts`](services/geminiService.ts).

## Non-Obvious Aspects
- **Lack of Testing Framework**: As of now, this project does not explicitly use a dedicated testing framework (e.g., Jest, React Testing Library). Any testing or validation currently relies on manual checks or the custom code checker.