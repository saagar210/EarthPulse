# EarthPulse Build Outline to Completion

## 1. VISION
**A real-time global disaster & space activity monitor that aggregates 14+ data sources (USGS, NASA, NOAA, etc.) into an interactive desktop app with replay, sonification, and AI-powered insights.**

---

## 2. CURRENT STATE

✅ **Working:**
- All 14 map layers rendering live data (earthquakes, ISS, solar, volcanoes, GDACS, EONET, satellites, asteroids, etc.)
- Full 24-hour replay system with play/pause/speed controls
- Historical earthquake explorer with date range + magnitude filters
- Custom watchlist system with proximity alerts
- Sonification (Web Audio API) for earthquakes & aurora
- Ollama local LLM integration for event summaries
- SQLite persistence for earthquakes, settings, watchlists
- Settings panel with full UI customization
- Screenshot export + CSV/GeoJSON data export
- Keyboard shortcuts for all layers (1-9, Space, R, S, ?)

⚠️ **Partially Working:**
- NASA Asteroid API uses hardcoded DEMO_KEY (rate-limited, ~50 req/hour)
- Volcano/meteor/plate data hardcoded at startup (comment says "future: dynamic fetch")
- Error handling solid, but no retry logic for transient failures
- ISS trail only stores 30-minute window (can't replay full trails for old timestamps)

❌ **Missing:**
- Test suite (0% coverage—only 1 validation test exists)
- CI/CD pipeline (no GitHub Actions)
- Automatic update mechanism
- Structured logging for production
- Solar event history storage (in-memory only, lost on restart)

---

## 3. BUILD PHASES TO COMPLETION

### **Phase 0: Quick Fixes** ⚡
*4–5 hours | Low Complexity | No Blockers*

Unblock production deployment:
- Replace NASA DEMO_KEY with env var `EARTHPULSE_NASA_API_KEY` (fallback to DEMO_KEY with warning)
- Add dynamic fetcher for Smithsonian volcanoes (RSS feed; keep hardcoded as fallback)
- Store full ISS position history instead of 30-min window (enable full replay trails)
- Verify build: `pnpm lint`, `pnpm tsc --noEmit`, `pnpm tauri build`

**Complexity:** Low
**Blocker:** No—can ship v0.1.0 after this phase
**Touches:** `src-tauri/src/fetchers/{asteroid,volcano}.rs`, `src-tauri/src/db.rs`, `tauri.conf.json`

---

### **Phase 1: Test Foundation** 🧪
*6–8 hours | Medium Complexity | Depends on Phase 0*

Build confidence and catch regressions:
- Add fetcher unit tests (mock HTTP, test parsing, error scenarios)
  - File: `src-tauri/src/fetchers/mod.rs` (test module)
  - Cover: earthquake, gdacs, eonet, solar_event, asteroid, tle parsing
- Add database tests (table creation, inserts, TTL eviction, cleanup)
  - File: `src-tauri/src/db.rs` (test module)
- Add calculation tests (terminator math, SGP4 propagation)
  - File: `src-tauri/src/calculations/mod.rs` (test modules)
- Add frontend store snapshot tests (initialization, state updates, error paths)
  - Files: `src/stores/**/*.test.ts`

**Complexity:** Medium
**Blocker:** Yes—wait for Phase 0 to merge first
**Touches:** All backend fetchers, database, calculations; frontend stores

---

### **Phase 2: Production Hardening** 🛡️
*3–4 hours | Low–Medium Complexity | Depends on Phase 1*

Make app production-ready:
- Add exponential backoff retry logic to HTTP client (2s, 4s, 8s, 16s max)
  - File: `src-tauri/src/fetchers/http.rs`
- Configure tauri-plugin-log with file output (save logs to `~/.earthpulse/app.log`)
  - File: `src-tauri/src/lib.rs`
- Move hardcoded API endpoints to env vars with sensible defaults
  - File: `src-tauri/src/fetchers/mod.rs` + `.env.example`
- Add Ollama status check + graceful degradation (cache summary if Ollama unavailable)
  - File: `src-tauri/src/commands/summary.rs`

**Complexity:** Low–Medium
**Blocker:** No—can do in parallel with Phase 1
**Touches:** HTTP client, logging, command handlers

---

### **Phase 3: CI/CD Pipeline** 🚀
*4–6 hours | Medium Complexity | Depends on Phase 1*

Automate testing and releases:
- Create `.github/workflows/test.yml`: Run tests on every push
  - Steps: `cargo test`, `cargo clippy`, `pnpm lint`, `pnpm tsc --noEmit`
- Create `.github/workflows/build.yml`: Cross-platform builds on release tags
  - Build for macOS, Windows, Linux; upload artifacts to GitHub Releases
- Create `.github/workflows/security.yml`: Dependency scanning (cargo-audit, npm audit)
- Update `.github/CONTRIBUTING.md`: Developer setup guide

**Complexity:** Medium
**Blocker:** No—do after Phase 1 tests pass
**Touches:** `.github/workflows/`, `CONTRIBUTING.md`

---

### **Phase 4: Feature Completion** ✨
*6–8 hours | Medium Complexity | Depends on Phase 2*

Fill remaining feature gaps:
- Add solar event history storage (new `solar_events` table)
  - Files: `src-tauri/src/db.rs`, `src-tauri/src/models/solar_event.rs`
  - Query historical solar activity in replay mode
- Virtualize long event lists (react-window for 1000+ earthquakes)
  - File: `src/components/Sidebar/EventFeed.tsx`
- Add GDACS alert history (persist 7-day window)
  - Files: `src-tauri/src/db.rs`, `src-tauri/src/commands/gdacs.rs`
- Implement automatic app updater (tauri-plugin-updater)
  - File: `src-tauri/src/main.rs`

**Complexity:** Medium
**Blocker:** No—can do in parallel with Phase 3
**Touches:** Database schema, frontend components, main.rs

---

### **Phase 5: Performance & Polish** 🎨
*3–4 hours | Low Complexity | Depends on Phase 4*

Optimize and refine:
- Reduce SQLite query frequency (cache earthquake count with 1-min TTL)
  - File: `src-tauri/src/db.rs`
- Batch API responses (send 5–10 earthquakes per IPC emit, not 1-by-1)
  - File: `src-tauri/src/commands/earthquake.rs`
- Paginate historical queries (chunk date ranges >1 month)
  - File: `src-tauri/src/commands/historical.rs`
- Add dark/light theme toggle (Tailwind config already supports it)
  - File: `src/App.tsx` (theme provider setup)

**Complexity:** Low
**Blocker:** No
**Touches:** Database, command handlers, frontend App component

---

### **Phase 6: Documentation** 📚
*2–3 hours | Low Complexity | Depends on Phase 5*

Record knowledge for maintainers:
- Write `ARCHITECTURE.md` (Tauri design, data flow, IPC contracts)
- Write `API.md` (IPC command reference—every command + params + return types)
- Update `README.md` (quick start, features list, keyboard shortcuts, troubleshooting)
- Write `CONTRIBUTING.md` (how to add new data source, run tests, build locally)

**Complexity:** Low
**Blocker:** No
**Touches:** `./*.md` files

---

## 4. RECOMMENDED NEXT PHASE

### **Start with Phase 0 + Phase 1 together (next 2–3 hours)**

**Why:**
- **Phase 0** (4–5h) unblocks shipping v0.1.0 production release immediately
  - Fixes rate-limit bug, enables dynamic volcanoes, completes replay
  - Zero risk, high reward

- **Phase 1** (6–8h) prevents regressions and gives confidence to ship
  - 100+ tests across fetchers, database, calculations, stores
  - Catches bugs before they reach users
  - Compounds ROI of Phase 0 (tests ensure fixes don't regress)

**Sequential approach:**
1. **Commit 0a:** Fix NASA API key + verify build works
2. **Commit 0b:** Add volcano fetcher + ISS history
3. **Commit 1a–1d:** Add test suites (fetchers → db → calcs → frontend)
4. **Merge to main & tag v0.1.0**

**If only 2–3 hours available:** Do **Phase 0 only**. Ship v0.1.0. Schedule Phase 1 for next session.

---

## VERSION ROADMAP

| Version | Timeline | Focus |
|---------|----------|-------|
| **v0.1.0** | This week | Launch with Phase 0 fixes |
| **v0.2.0** | Next sprint | Phase 1–2 (tests + hardening) |
| **v0.3.0** | Following sprint | Phase 3 (CI/CD automation) |
| **v1.0.0** | Month 2 | Phase 4–6 (features, perf, docs) |

---

## RISK MATRIX

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| NASA DEMO_KEY rate limit | 🔴 High | 🔴 Immediate | Phase 0 (env var) |
| No test coverage → regression | 🔴 High | 🟡 Medium | Phase 1 (test suite) |
| Missing CI/CD → human error | 🟡 Medium | 🟡 Medium | Phase 3 (GitHub Actions) |
| Solar/GDACS history loss | 🟡 Medium | 🟢 Low | Phase 4 (DB storage) |
| No auto-update → stale clients | 🟡 Medium | 🟢 Low | Phase 4 (tauri-plugin-updater) |

---

## FILES TO TOUCH (by phase)

**Phase 0:** `src-tauri/src/fetchers/{asteroid,volcano}.rs`, `src-tauri/src/db.rs`, `tauri.conf.json`
**Phase 1:** `src-tauri/src/{fetchers,db,calculations}/mod.rs` (test modules), `src/stores/**/*.test.ts`
**Phase 2:** `src-tauri/src/fetchers/http.rs`, `src-tauri/src/lib.rs`, `.env.example`
**Phase 3:** `.github/workflows/{test,build,security}.yml`, `CONTRIBUTING.md`
**Phase 4:** `src-tauri/src/db.rs` (new tables), `src/components/Sidebar/EventFeed.tsx`, `src-tauri/src/main.rs`
**Phase 5:** `src-tauri/src/{db,commands}.rs`, `src/App.tsx`
**Phase 6:** `ARCHITECTURE.md`, `API.md`, `README.md`, `CONTRIBUTING.md`

---

## SUCCESS CRITERIA

- ✅ Phase 0: Build passes, NASA API key configurable, volcanoes fetch dynamically, ISS replay works for old timestamps
- ✅ Phase 1: 80%+ test coverage, all tests pass, no regressions detected
- ✅ Phase 2: Retries work, logs written to file, Ollama gracefully degrades
- ✅ Phase 3: Tests run on every push, builds on release tags, artifacts auto-uploaded
- ✅ Phase 4: Solar/GDACS history queryable, app auto-updates, event list performant at 1000+ items
- ✅ Phase 5: Database queries <100ms, IPC batch payloads, no memory leaks
- ✅ Phase 6: Docs complete, new contributors can onboard in <30 min
