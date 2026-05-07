#!/usr/bin/env bash
# setup-dev.sh — one-command dev environment setup
set -e

echo "🌾 AgroChain Africa — Dev Setup"
echo "================================"

# 1. Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js 20+ required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose required"; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required (found v$NODE_VERSION)"; exit 1
fi

echo "✅ Prerequisites OK"

# 2. Backend .env
if [ ! -f apps/backend/.env ]; then
  cp apps/backend/.env.example apps/backend/.env
  # Generate a random JWT secret
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" apps/backend/.env
  echo "✅ Created apps/backend/.env with random JWT_SECRET"
else
  echo "ℹ️  apps/backend/.env already exists, skipping"
fi

# 3. Start infrastructure
echo "🐳 Starting postgres + redis..."
docker compose -f docker/docker-compose.yml up -d postgres redis
echo "⏳ Waiting for postgres to be ready..."
sleep 5

# 4. Install backend deps
echo "📦 Installing backend dependencies..."
cd apps/backend && npm install --silent && cd ../..

# 5. Install frontend deps
echo "📦 Installing frontend dependencies..."
cd apps/frontend && npm install --silent && cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run backend:   cd apps/backend && npm run start:dev"
echo "  2. Run frontend:  cd apps/frontend && npm start"
echo "  3. API docs:      http://localhost:3000/api/docs"
echo "  4. App:           http://localhost:4200"
echo ""
echo "Optional — deploy Soroban contracts to testnet:"
echo "  cd contracts && stellar contract build"
echo "  Then follow docs/stellar-integration.md"
