# Contributing to HarvConnect

Thank you for your interest in contributing to HarvConnect.

We welcome bug fixes, documentation improvements, feature enhancements, performance optimizations, and security improvements.

## Development Workflow

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feat/your-feature-name
```

3. Install dependencies.

```bash
npm install
```

4. Create a local `.env` file using `.env.example`.

5. Run database migrations.

```bash
npx prisma migrate dev
```

6. Run the development server.

```bash
npm run dev
```

## Before Submitting

Please ensure that:

- Your code follows the existing project structure.
- Existing APIs remain backward compatible unless discussed.
- New features include appropriate validation.
- No secrets or environment variables are committed.
- All tests pass successfully.

Run:

```bash
npm test
```

## Commit Convention

This project follows Conventional Commits.

Examples:

```text
feat: add transporter availability endpoint
fix: resolve JWT expiration bug
refactor: simplify auth token service
docs: update API documentation
test: add marketplace integration tests
```

## Pull Requests

Before opening a Pull Request, please verify:

- The project builds successfully.
- All tests pass.
- Swagger documentation has been updated if APIs changed.
- Prisma migrations are included if the database schema changed.
- README documentation reflects any user-facing changes.

Thank you for helping improve HarvConnect.
