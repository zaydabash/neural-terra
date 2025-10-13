.PHONY: dev test build run clean install check-snapshots smoke-test e2e-test capture-hero

# Development
dev:
	cp infra/dev.env.example .env
	docker compose -f infra/docker-compose.yml up --build

# Testing
test:
	docker compose -f infra/docker-compose.yml exec backend pytest
	docker compose -f infra/docker-compose.yml exec frontend npm run lint

# Snapshot integrity check
check-snapshots:
	python3 scripts/check_snapshots.py

# Backend smoke test
smoke-test:
	python3 scripts/smoke_backend.py

# Frontend e2e tests
e2e-test:
	cd apps/frontend && npx playwright test

# Hero capture
capture-hero:
	node scripts/capture_hero.js

# Build
build:
	docker compose -f infra/docker-compose.yml build

# Run production
run:
	cp infra/prod.env.example .env
	docker compose -f infra/docker-compose.yml up -d

# Clean up
clean:
	docker compose -f infra/docker-compose.yml down -v
	docker system prune -f

# Install dependencies locally
install:
	cd apps/backend && pip install -r requirements.txt
	cd apps/frontend && npm install

# Backend only
backend:
	cd apps/backend && python main.py

# Frontend only  
frontend:
	cd apps/frontend && npm run dev

# Generate types
types:
	cd apps/frontend && npx openapi-typescript http://localhost:8000/openapi.json -o types/api.ts

# Bundle analysis
analyze:
	cd apps/frontend && npm run analyze

# Full CI pipeline (local)
ci: check-snapshots test smoke-test e2e-test build
