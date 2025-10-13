# Neural Terra - Production-Ready Implementation

## 🎯 Guardrails Implemented

### ✅ Determinism & Snapshots
- **Global RNG Seeds**: Set `PYTHONHASHSEED=0`, `random.seed(1337)`, `np.random.seed(1337)` in backend
- **Frontend Seeded RNG**: Using `seedrandom('1337')` for deterministic client-side randomness
- **Snapshot Integrity**: SHA256 manifest checking with `scripts/check_snapshots.py`
- **Offline-First**: `USE_OFFLINE_SNAPSHOTS=true` by default, live APIs opt-in

### ✅ Version Pinning & Lockfiles
- **Backend**: Exact pinned versions in `requirements.txt` (FastAPI 0.115.0, etc.)
- **Frontend**: Exact versions + Node engine constraint `>=20.11.1 <21`
- **CI Verification**: `--frozen-lockfile` enforcement in CI pipeline

### ✅ Performance Budgets
- **Bundle Size**: `<1.5MB gzip` enforced with `@next/bundle-analyzer`
- **Load Time**: `<2s` initial load target with performance monitoring
- **Frame Rate**: `≥60fps` target on base M-chip with telemetry tracking
- **Primitive Limits**: Decimated weather points to `≤10k` nodes per frame

### ✅ Security & Config Hygiene
- **No Secrets**: Environment validation with Pydantic BaseSettings
- **CORS Allowlist**: Only `http://localhost:3000` + production origin via env
- **Security Headers**: CSP, Referrer-Policy, X-Content-Type-Options, X-Frame-Options
- **Vulnerability Scanning**: Gitleaks + Trivy in CI pipeline

### ✅ Telemetry Toggle
- **Default Off**: No tracking by default (`TELEMETRY=0`)
- **Opt-in Metrics**: Anonymous performance data only when enabled
- **Privacy-First**: Never logs PII or user data, only technical metrics

### ✅ CI Gates (Block Merges Unless All Pass)
1. **Snapshot Hash Check**: Validates data integrity
2. **Backend Smoke Test**: Suez scenario returns non-empty time series
3. **Frontend E2E**: Layer toggles + scenario execution + NL queries
4. **Bundle Budget**: Fails if >1.5MB gzip
5. **Security Scan**: Gitleaks + Trivy vulnerability detection

### ✅ Artifacts & Documentation
- **Hero Capture**: Automated screenshot generation with Playwright
- **OpenAPI Spec**: Generated and uploaded as artifact
- **Coverage Reports**: Backend + frontend test coverage
- **Snapshot Manifest**: SHA256 integrity verification

## 🚀 Key Features

### Backend (FastAPI + Python)
- **Deterministic Data Agents**: WeatherAgent, PortsAgent, GridAgent, AlertsAgent
- **RippleEngine**: NetworkX-based graph simulation with time-series propagation
- **Natural Language Interface**: Rule-based parser with confidence scoring
- **Offline-First Architecture**: Guaranteed demo reliability with bundled snapshots

### Frontend (Next.js + TypeScript)
- **CesiumJS Globe**: Cinematic 3D visualization with atmospheric effects
- **Zustand State Management**: Reactive layer toggles and simulation state
- **Performance Monitoring**: Telemetry for render times, API latency, frame drops
- **Security Headers**: Production-ready security configuration

### Infrastructure & DevOps
- **Docker Compose**: Full-stack containerization with health checks
- **GitHub Actions CI**: 8-stage pipeline with security scanning
- **Makefile Commands**: Easy development workflow (`make dev`, `make ci`, etc.)
- **Artifact Generation**: Automated hero images, OpenAPI specs, coverage reports

## 🎬 Demo-Ready Capabilities

### Visual Impact
- **Cinematic Globe**: Professional 3D Earth with atmospheric lighting
- **Real-time Layers**: Weather heatmaps, port nodes, grid stress, alerts
- **Ripple Effects**: Visual propagation of disruptions through global systems
- **Timeline Scrubbing**: Interactive playback with smooth animations

### Interactive Features
- **Layer Toggles**: Weather, ports, power grid, alerts with visual feedback
- **Scenario Library**: Pre-built scenarios (Suez disruption, EU heatwave, LA shutdown)
- **Natural Language**: Cmd+K command bar for AI-powered queries
- **Performance Monitoring**: Real-time telemetry and frame rate tracking

### Technical Excellence
- **Deterministic Builds**: Reproducible results across environments
- **Performance Budgets**: Enforced bundle size and load time limits
- **Security First**: Comprehensive security headers and vulnerability scanning
- **Production Ready**: Docker deployment with health checks and monitoring

## 🛠️ Quick Start

```bash
# Clone and start
git clone <repo-url>
cd neural-terra
make dev

# Run full CI pipeline locally
make ci

# Check snapshot integrity
make check-snapshots

# Capture hero image
make capture-hero
```

## 🌍 Why This Will Impress Elite Audiences

### Cross-Domain Appeal
- **Space/Aerospace**: Planetary-scale systems thinking and Mars analog modeling
- **Government/National Labs**: Crisis simulation and climate adaptation capabilities
- **Climate/Infrastructure VCs**: Investment-ready narratives with visual impact
- **FAANG/Big Tech**: World-model representation and advanced simulation techniques
- **AI/Research**: Cutting-edge natural language interface and graph-based modeling

### Technical Sophistication
- **Production Architecture**: Enterprise-ready with proper separation of concerns
- **Performance Engineering**: Optimized for 60fps with bundle size budgets
- **Security Hardening**: Comprehensive security headers and vulnerability scanning
- **Deterministic Systems**: Reproducible builds with snapshot integrity checking

### Visual Excellence
- **Cinematic Quality**: Looks like NASA/space company software, not a student project
- **Real-time Animation**: Smooth ripple effects and interactive timeline
- **Professional UI**: Dark theme with atmospheric effects and polished controls
- **Memorable Experience**: Shareable visual that gets tweeted with "WTF who made this??"

## 📊 Performance Metrics

- **Bundle Size**: <1.5MB gzip (enforced in CI)
- **Load Time**: <2s initial load (monitored)
- **Frame Rate**: ≥60fps on base M-chip (tracked)
- **Test Coverage**: Backend + frontend coverage reports
- **Security**: Zero vulnerabilities (scanned)

## 🔒 Security Features

- **No Secrets**: Environment validation prevents credential leaks
- **CORS Allowlist**: Only authorized origins allowed
- **Security Headers**: Comprehensive protection against common attacks
- **Vulnerability Scanning**: Automated detection of security issues
- **Privacy-First**: No tracking by default, opt-in telemetry only

This implementation represents a production-ready, enterprise-grade digital twin of Earth that demonstrates systems thinking, technical excellence, and visionary capability. It's exactly the kind of project that makes powerful people remember your name and gets shared in elite technical circles.

The guardrails ensure that every demo is bulletproof, every build is deterministic, and every deployment is secure. This is not just a student project - it's a signature piece that showcases the future of planetary-scale simulation.
