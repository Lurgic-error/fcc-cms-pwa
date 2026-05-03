# FCC PWA Ecosystem Improvement Plan (v2)

_Authored 2026-05-03._

## Summary
Focus only on the four active repos: `fcc-website-infrastructure`, `fcc-cms-server`, `fcc-cms-pwa`, `fcc-official-website`.

`fcc-cms-server` is effectively complete for this planning cycle: P0–P3 audit items are closed except FIMS provider verification (cross-team) and OTel collector deployment (operational). Baseline: **1337 server tests pass, 0 lint errors.**

The next highest-leverage work is making `fcc-cms-pwa` consume the server improvements and become the operational control plane for the public website. **Some Website Content Control Slices listed below imply NEW server work** — called out explicitly in §"Server Prerequisites".

## Current Baselines
| Repo | Tests | Lint | Notes |
|---|---|---|---|
| `fcc-cms-server` | 1337 pass | 0 / 0 | Done for this cycle |
| `fcc-cms-pwa` | 49 pass / 20 files | 1 err / 24 warn | 146 pages · 74 components · 50 router · 34 API · 20 utils · 46 stores |
| `fcc-official-website` | (not surveyed) | (not surveyed) | Existing CDC sanitize test passes |
| `fcc-website-infrastructure` | n/a | n/a | Track work added below |

Source-of-truth roadmap for module work: `fcc-cms-pwa/docs/fcc-cms-pwa-feature-checklist.md`.

## Risks & Rollout Strategy

| Risk | Mitigation |
|---|---|
| Envelope sync (Phase 1 #4) is a contract change — call sites that read `response.data.{field}` directly will break when the interceptor unwraps `{data, error}` | Migrate one `*API.js` per PR. Don't enable interceptor auto-unwrap until **all** files are migrated; staging gate with feature flag `VITE_API_ENVELOPE_AUTOUNWRAP` |
| `SameSite=Lax` + Origin guard (server-side) means cross-origin auth requests fail | Confirm PWA + server are same-origin in **dev / staging / prod**. Document any non-same-origin path with explicit `Access-Control-Allow-*` plan |
| Sunset header banner shown to System Admins before they're warned could trigger panic | Operator buy-in before enabling; banner copy reviewed; first ramp via `VITE_SHOW_DEPRECATION_BANNER` env |
| Idempotency-Key rollout reaches the FIMS path before the FCC infra side accepts it | Confirm FIMS gateway accepts `Idempotency-Key`; fallback: server treats requests without it as one-shot (already does) |
| Audit-log reader UI surfaces PII (IPs, user-agents) to Admins who shouldn't see it | Default-redact in the UI per role; full record only for `system admin` role |
| Website Content Slices imply new server domains — surprise scope mid-Phase 2 | See §"Server Prerequisites" — schedule those server changes BEFORE the corresponding PWA slice |

## Phase -1: Survey (1 turn, prerequisite to Phase 0)
Run a pre-flight audit so Phase 1 has defensible sizing.

- **API envelope readiness matrix.** For each of the 34 `src/api/*API.js` files, classify as: *envelope-clean* / *needs migration* / *consumer-side reads need updating*.
- **Lint warning triage.** Of the 24 cypress-chain warnings, separate "real bug" vs "intentional pattern → allowlist."
- **In-Progress module dependencies.** For each Phase 2 module, note which Phase 1 piece(s) it blocks on (envelope sync, idempotency, etc.).
- **Server-prereq survey.** Confirm whether each Website Slice (§ Server Prerequisites) is fully missing on the server or partially exists.

**Exit criteria:** survey doc committed at `docs/pwa-improvement-survey-2026-05-03.md` listing every API file's envelope status + every blocked module + every missing server endpoint.

## Phase 0: Baseline Cleanup (1 turn)
- Fix `src/utils/renderSanitizationContract.test.js` lint error (`process` undefined → mark as Node env or read via `import.meta.env`)
- Triage 24 Cypress chained-command warnings using the survey output (split chains for real issues, allowlist intentional patterns)
- Add `lint:check` script that runs ESLint without `--fix` (CI-safe)
- Confirm Vitest `test/` glob covers the intended files

**Exit criteria:** `npm run lint:check` exits 0/0. `npm run test:unit -- --run` exits 0 with at least 49 tests still green.

### `fcc-official-website` in Phase 0
No work this phase.

### Infrastructure in Phase 0
No work this phase.

## Phase 1: Server Contract Sync (5 turns)

### #4 — Envelope sync (1–2 turns, depends on survey)
Standardize API response consumption around `{data, error: {code, message, details?}}`. Migrate `src/api/*API.js` one at a time per the survey matrix. Interceptor auto-unwrap stays OFF behind `VITE_API_ENVELOPE_AUTOUNWRAP` until every consumer is migrated.

**Exit:** every `*API.js` file reads from the standard envelope. Interceptor auto-unwrap enabled in staging. At least 10 new tests covering interceptor + 3 representative API adapters.

### #5 — Audit-log reader UI (2–3 turns)
Wire the System module's "Activity log/audit" surface to the server's three endpoints:
- `GET /api/admin/audit/users/:userId`
- `GET /api/admin/audit/resources/:type/:id`
- `GET /api/admin/audit/actions/:action`

Components: 1 store (`useAuditLogStore`) + 1 page + filter UI (date range, action, actor, resource type/id) + paginated list (uses standard `{page, limit, total, totalPages}` envelope). Default-redact PII per role.

**Exit:** route lands at `/system/audit/{users|resources|actions}`; integration test uses Cypress against a seeded server fixture; at least 8 unit tests (store + filter logic).

### #6 — Sunset/Deprecation banner (1 turn)
Axios interceptor reads `Sunset` + `Deprecation` headers; surface a System Admin banner + console warning. Behind `VITE_SHOW_DEPRECATION_BANNER` flag (off by default until operator buy-in).

**Exit:** banner renders for System Admins when header arrives; at least 3 tests cover header parsing + role gate + flag gate.

### #7 — Idempotency-Key emission (1 turn)
Generate `Idempotency-Key: <uuid>` for POST mutations on retry-safe paths (editorial-intake submit, FIMS relays, inquiry submission). Header is added by an Axios request interceptor; per-request opt-out for true non-idempotent operations (none today).

**Exit:** every POST call site that should be idempotent carries the header; at least 4 tests pin generation + opt-out + retry behavior.

### #8 — `traceparent` propagation (1 turn)
Generate or forward W3C `traceparent` on every outbound axios call. If the page already has one (e.g. server-injected initial load), forward; else generate a fresh one.

**Exit:** every axios request emits `traceparent`; at least 3 tests pin the W3C format + forwarding precedence.

### `fcc-official-website` in Phase 1
- Adopt the same envelope sync logic if it consumes `/api/v1` (likely small subset)
- Inherit the Sunset banner pattern (console-only — no admin banner)

### Infrastructure in Phase 1
- Verify same-origin PWA + server in all environments (or document the CORS plan)
- Provision OTel collector endpoint so traceparent propagation has somewhere to land
- Provision Sentry DSN

## Phase 2: Roadmap In-Progress Modules (parallel to Phase 3)
Per `docs/fcc-cms-pwa-feature-checklist.md` In-Progress section:
- Assets / Photos: finish upload, usage, archive action routes
- Subscribers: align with stable server pagination contract (depends on Phase 1 #4)
- Commission: full singleton edit-form parity (exercises the audited mutation surface)
- System module: activity log (depends on Phase 1 #5), audit, workflow monitor, scheduled jobs
- Dashboard & Visitors: richer analytics widgets

**Exit per module:** every In-Progress row in the feature checklist marked "Implemented" with at least 1 happy-path Cypress flow + unit coverage on the new store + adapter.

### `fcc-official-website` in Phase 2
No work this phase unless Subscribers module exposes a new public newsletter signup endpoint (then add corresponding consumer).

### Infrastructure in Phase 2
No work this phase.

## Phase 3: Quality Gates (parallel track to Phase 2 — don't block module velocity)
- Coverage target: **at least 80% on `src/api`, `src/stores`, `src/utils`; opportunistic on components and pages.** Total at least 150 unit tests.
- Accessibility baseline: axe-core sweep on shared resource shells; document hard rules
- Security posture: CSP review, service-worker scope, authenticated API network-only policy
- Bundle-size budgets: per-route ceiling; CI fails over budget

**Exit:** coverage target met (measured via `vitest --coverage`); axe-core report committed; bundle-size CI step active; CSP applied via infrastructure (see Infra track).

### `fcc-official-website` in Phase 3
- Mirror axe-core sweep
- Mirror bundle-size budget

### Infrastructure in Phase 3
- CSP headers via reverse proxy (covers both PWA + website)
- Bundle-size CI gate provisioned (likely GitHub Action)

## Phase 4: Planned Roadmap Items
Per `docs/fcc-cms-pwa-feature-checklist.md` Planned section:
- Workflow Automation UI: submit / approve / reject / publish / unpublish / archive / restore per module
- Multi-language authoring: per-locale entry + validation
- Notification integrations: review / publish / archive / SLA triggers
- Schema platform expansion across remaining modules
- PWA hardening: installability, offline shell strategy, runtime cache controls

**Exit per item:** moves from "Planned" to "Implemented" in the checklist with at least 1 Cypress flow.

## Server Prerequisites for Website Content Control Slices
Each PWA slice below depends on server work. **Schedule these server changes BEFORE the corresponding PWA slice or the slice stalls mid-execution.**

| PWA Slice | Server Prereq | Estimated Server Effort |
|---|---|---|
| `static_pages` admin (privacy, terms, disclaimer, copyright) | New domain: `staticPage` entity + repository + use-cases (CRUD + publish) + route + content-version integration | M (1-2 days) |
| `merger_thresholds` singleton with effective dates + history | Likely new domain `mergerThresholds` (singleton like commission). Effective-dating means a sub-doc array `[{value, effectiveFrom, recordedBy}]` | M (1-2 days) |
| `services.isCore` + `services.displayOrder` | Add fields to `services` schema; expose via update endpoint; sort-by-order on public list | S (half day) |
| `/api/v1/sitemap.xml` | New public route generating XML from currently-published content (articles, publications, events, services); cache header tuning | M (1 day) |

## Per-Phase Exit Criteria (rolled up)
| Phase | Done means |
|---|---|
| -1 Survey | Survey doc committed listing every blocker |
| 0 Baseline | `lint:check` 0/0; tests still green |
| 1 Contract Sync | All 5 server-contract pieces shipped + tested; at least 30 net new PWA tests |
| 2 In-Progress | Every In-Progress checklist row marked Implemented |
| 3 Quality Gates | At least 80% coverage on api/stores/utils; at least 150 tests; axe-core baseline; bundle-size CI live |
| 4 Planned | Each row migrated from Planned to Implemented |

## Recommended Start Order
1. **Phase -1 Survey** (1 turn — prerequisite)
2. **Phase 0 Cleanup**
3. **Phase 1 in declared order** (#4 envelope → #5 audit reader → #6 sunset banner → #7 idempotency → #8 traceparent)
4. **Phase 2 + Phase 3 in parallel** (Phase 3 = side track, doesn't block module velocity)
5. **Phase 4** as discrete vertical slices

## Test Plan
- PWA unit: `npm run test:unit -- --run`
- PWA lint (CI-safe, added in Phase 0): `npm run lint:check`
- PWA build: `npm run build`
- PWA coverage (added in Phase 3): `npm run test:unit -- --run --coverage`
- PWA E2E: `npm run test:e2e:auth-role:full` + `npm run test:e2e:module-flows:full`
- New focused tests required: interceptor envelope handling, audit store + filter, idempotency key generation, traceparent generation, Sunset banner role gate
- Cypress: role-gated System audit flows, critical workflow actions per module
- Infrastructure smoke checks: `cms-server`, `cms-pwa`, `official-website`, `/content/v1/public-endpoints`, `/sitemap.xml` (once Phase-1-prereq landed), `/metrics` (token-gated)

## Cross-Repo Coordination
| Need | Owner | Status |
|---|---|---|
| Server envelope shape | server | Done |
| Audit-log read endpoints | server | Done |
| Server expects Idempotency-Key | server | Done |
| Server emits Sunset header | server | Done |
| Server emits traceparent on responses | server | Done |
| OTel collector deployed | infrastructure | Pending |
| Sentry DSN provisioned | infrastructure | Pending |
| `static_pages` domain on server | server | Scheduled before PWA slice |
| `merger_thresholds` domain on server | server | Scheduled before PWA slice |
| `services.isCore` + `displayOrder` | server | Scheduled before PWA slice |
| `/api/v1/sitemap.xml` | server | Scheduled before PWA slice |

## Assumptions
- `fcc-official-website` remains the public-site source of truth
- `fcc-cms-server` and `fcc-cms-pwa` are deployed same-origin in all environments (or CORS plan documented)
- Solo-execution model — Phase 3 "parallel track" assumes a different agent or a different engineer; if not, Phase 3 becomes serial after Phase 2
- New server domains in §"Server Prerequisites" are part of the next server work cycle, not blockers for Phase 0/1
- Delivery stays vertical-slice based; immediate priority is Phase -1 + Phase 0 + Phase 1 because they consume work already shipped

## Revision History
- **v2 (2026-05-03)** — added Phase -1 Survey; Risks & Rollout Strategy section; Server Prerequisites for Website Slices; Per-Phase Exit Criteria rollup; per-phase mini-sections for `fcc-official-website` + Infrastructure; Phase 3 explicitly marked parallel track; Cross-Repo Coordination matrix; refined coverage target with denominator
- **v1** — initial draft (server-side complete, PWA next, 5-phase outline)
