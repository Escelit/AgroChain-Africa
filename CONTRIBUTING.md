# Contributing to AgroChain Africa

Thank you for your interest in contributing! This guide will get you from zero to a running dev environment.

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org) |
| Docker + Compose | Latest | [docker.com](https://docker.com) |
| Rust | stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| stellar-cli | latest | `cargo install stellar-cli` |
| Freighter wallet | latest | [freighter.app](https://freighter.app) (browser extension) |

## Quick Start

```bash
git clone https://github.com/Escelit/AgroChain-Africa.git
cd AgroChain-Africa
./setup-dev.sh
```

That script will:
- Copy `.env.example` → `.env` with a generated JWT secret
- Start postgres + redis via Docker
- Install all npm dependencies

Then in two terminals:

```bash
# Terminal 1 — backend
cd apps/backend && npm run start:dev

# Terminal 2 — frontend
cd apps/frontend && npm start
```

- **API**: http://localhost:3000/api
- **Swagger docs**: http://localhost:3000/api/docs
- **App**: http://localhost:4200

## Project Structure

```
apps/backend/     NestJS API
apps/frontend/    Angular 17 PWA
contracts/        Soroban smart contracts (Rust)
docker/           Docker Compose files
docs/             Architecture and integration guides
```

## Running Tests

```bash
# Backend unit tests
cd apps/backend && npm test

# Backend e2e (requires running DB)
cd apps/backend && npm run test:e2e

# Frontend unit tests
cd apps/frontend && npm test

# Soroban contract tests
cd contracts && cargo test
```

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<short-description>` | `feat/lender-dashboard` |
| Bug fix | `fix/<short-description>` | `fix/escrow-expiry-check` |
| Test | `test/<short-description>` | `test/oracle-processor` |
| Docs | `docs/<short-description>` | `docs/ussd-gateway` |
| Chore | `chore/<short-description>` | `chore/upgrade-stellar-sdk` |

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat(backend): add lender portfolio endpoint
fix(frontend): correct escrow status badge color
test(contracts): add escrow refund expiry test
docs: update Stellar integration guide
```

Scope options: `backend`, `frontend`, `contracts`, `infra`, `docs`

## Pull Request Process

1. Branch off `main`
2. Write tests for new code
3. Ensure `npm test` passes locally
4. Keep PRs focused — one feature or fix per PR
5. Fill in the PR template
6. Request review from a maintainer

## Good First Issues

Look for issues tagged [`good first issue`](https://github.com/Escelit/AgroChain-Africa/issues?q=label%3A%22good+first+issue%22). Good starting points:

- **Frontend**: Wire NgRx store for loans and auth slices
- **Frontend**: Implement buyer "Make Offer" flow in marketplace
- **Backend**: Add `GET /marketplace/stats` endpoint using StatsService
- **Backend**: Sync on-chain credit score back to DB after escrow release
- **Contracts**: Add integration test for full escrow lifecycle
- **Docs**: Write USSD gateway integration guide

## Environment Variables

The minimum set needed to run locally (all others are optional):

```env
DATABASE_URL=postgresql://agrochain:password@localhost:5432/agrochain_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=<any random string>
STELLAR_NETWORK=testnet
```

Everything else (contract IDs, anchor URLs, Sentinel Hub keys) can be left blank — the code has mock fallbacks for all external services.

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for system diagrams and [`docs/stellar-integration.md`](docs/stellar-integration.md) for Stellar/Soroban specifics.

## Code Style

- **Backend**: NestJS conventions, class-validator DTOs, no `any` in service layer
- **Frontend**: Angular standalone components, signals over RxJS where possible, Tailwind for styling
- **Contracts**: `#![no_std]`, explicit error messages in `assert!`, events on all state changes

## Questions?

Open a [GitHub Discussion](https://github.com/Escelit/AgroChain-Africa/discussions) or file an issue.
