# PokerNook GraphQL API: Contributing Guide

## Pull Request Guidelines

- Pushes to `main` will get deployed to production, so all development should be done in dedicated branches.

- Checkout a topic branch from the relevant branch (i.e. `main`), and merge back against that branch.

- If you add a new model to the Prisma schema, be sure to also add the relevant database migration and seed.

## Development Setup

You'll need Node.js and Docker installed. Use a package manager to install Node.js. VS Code is the recommended IDE.

Clone the repo, then run:

```bash
npm install # Install project dependencies
```

### NPM Scripts Overview

```bash
npm run dev # Create a hot-reloading GraphQL server

npm run build # Build application for deployment

npm run db:up # Create, migrate, and seed a local postgres db

npm run db:down # Destroy local postgres db
```
