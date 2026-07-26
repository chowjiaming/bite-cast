# BiteCast

Weather-aware day planner: go out or stay in, plus meal and drink ideas for a place and day.

Built from free, keyless public APIs (Open-Meteo, TheMealDB, TheCocktailDB, ipwho.is).

## Design

See [`docs/superpowers/specs/2026-07-26-bitecast-design.md`](docs/superpowers/specs/2026-07-26-bitecast-design.md).

## Status

v1 implemented. Run `npm run dev` for the SPA alone, or `npx netlify dev` to include the `/api/plan` function.

## Scripts

- `npm run dev` — Vite dev server (the API function is not served)
- `npx netlify dev` — full stack, including `/api/plan`
- `npm run test` — Vitest
- `npm run typecheck` — TypeScript
- `npm run build` — typecheck then production build
