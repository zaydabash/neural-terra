# CI Setup Guide

## Overview

The Neural Terra CI pipeline runs automated tests on every push and pull request. It consists of two jobs:

1. **Backend Job**: Runs Python tests independently for fast feedback
2. **Frontend Job**: Builds the frontend, starts the backend service, and runs end-to-end Playwright tests

## Required GitHub Secrets

### CESIUM_ION_TOKEN

The Cesium Ion token is required for the 3D globe visualization to work properly.

**To add this secret:**

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `CESIUM_ION_TOKEN`
5. Value: Your Cesium Ion access token (from `.env.local`)
6. Click **"Add secret"**

> [!IMPORTANT]
> Without this secret, the frontend build will succeed but the Cesium globe may not render properly in the e2e tests.

## How the CI Works

### Backend Job
```yaml
- Checks out code
- Sets up Python 3.11
- Installs dependencies from requirements.txt
- Runs pytest
```

### Frontend Job
```yaml
- Checks out code
- Sets up Node.js 20
- Sets up Python 3.11 (for backend service)
- Installs frontend dependencies
- Installs backend dependencies
- Starts backend service in background
- Waits for backend health check
- Builds frontend with environment variables
- Installs Playwright browsers
- Runs Playwright e2e tests
- Stops backend service
```

## Environment Variables in CI

The following environment variables are set during CI:

- `NEXT_PUBLIC_CESIUM_ION_TOKEN`: From GitHub secrets
- `NEXT_PUBLIC_API_URL`: Set to `http://localhost:8000` (backend service)
- `NEXT_TELEMETRY_DISABLED`: Set to `1` to disable Next.js telemetry
- `CI`: Set to `1` to indicate CI environment

## Troubleshooting

### Backend fails to start

Check the CI logs for the "Wait for backend health" step. If it times out:
- Verify `apps/backend/requirements.txt` has all dependencies
- Check for Python syntax errors in backend code
- Ensure `main.py` has a `/healthz` endpoint

### Playwright tests fail

Common issues:
- Backend not running: Check health check step passed
- Missing environment variables: Verify GitHub secrets are set
- Test timeouts: Backend may be slow to respond, adjust timeouts in `playwright.config.ts`

### Build fails

- Check that `CESIUM_ION_TOKEN` secret is set
- Verify Node.js and Python versions match local development
- Review build logs for specific errors

## Local Testing

To test the CI workflow locally:

```bash
# Run backend tests
cd apps/backend
pytest -v

# In one terminal, start backend
cd apps/backend
uvicorn main:app --reload --port 8000

# In another terminal, run frontend tests
cd apps/frontend
export NEXT_PUBLIC_API_URL=http://localhost:8000
export NEXT_PUBLIC_CESIUM_ION_TOKEN="your-token-here"
npm run build
npx playwright test
```

## CI Badge

Add this badge to your README to show CI status:

```markdown
[![CI Status](https://github.com/zaydabash/neural-terra/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/zaydabash/neural-terra/actions)
```
