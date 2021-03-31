# PokerNook GraphQL API

## Development Setup

### Recommended Tools

- Node.js
- Docker Desktop
- VS Code

Clone the repo, then run:

```bash
npm install # Install project dependencies

docker-compose up --detach # Run the database(s) with Docker

npm run dev # Run the app
```

### NPM Scripts Overview

```bash
npm run dev # Create a hot-reloading GraphQL server

npm run lint # Lint the project

npm run typecheck # Type-check the project

npm run build # Build application for deployment
```

## Contributing

### Pull Request Guidelines

- Pushes to `main` will get deployed to production, so all development should be done in dedicated branches.

- Checkout a topic branch from the relevant branch (i.e. `main`), and merge back against that branch.

- If you add or change a model in the Prisma schema, be sure to also add the relevant database migration and seed.
