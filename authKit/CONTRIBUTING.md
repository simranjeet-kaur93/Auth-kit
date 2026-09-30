# Contributing to AuthKit

Thanks for contributing. This guide keeps changes small, reviewable, and reliable.

## Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL + Redis)

## Local setup

1. Install dependencies:
   - `npm install`
2. Copy environment file:
   - `copy .env.example .env`
3. Start services:
   - `docker compose up -d`
4. Initialize DB:
   - `npm run db:setup`
5. Run apps:
   - `npm run dev`

## Development workflow

- Create focused changes by feature or bugfix.
- Keep API and web contracts in sync.
- Prefer adding small reusable modules over large page/service files.
- Use environment variables for all secrets and external config.

## Quality checks (required before PR)

- `npm run lint`
- `npm run build`
- For API changes, run migration/seed commands if schema or auth flow changed.

## Database changes

- Generate migration: `npm run migration:generate --workspace api`
- Run migration: `npm run migration:run --workspace api`
- Revert last migration: `npm run migration:revert --workspace api`

Do not rely on `synchronize`; schema changes should always go through migrations.

## Commit guidelines

- Keep commits small and descriptive.
- Use intent-first messages (why the change exists).
- Include test/validation notes in PR description.

## Pull request checklist

- [ ] Change is scoped and readable.
- [ ] Lint/build pass locally.
- [ ] New env vars are documented in `.env.example`.
- [ ] README/CONTRIBUTING docs updated when behavior or setup changed.
