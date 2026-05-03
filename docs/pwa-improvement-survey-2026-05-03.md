# FCC CMS PWA Improvement Survey

Authored: 2026-05-03

## Scope

This survey covers the Phase -1 pre-flight for `fcc-cms-pwa` and the cross-repo blockers that affect Phase 0 and Phase 1 of the execution plan.

The server remains effectively done for this cycle. The outstanding server-side items are either cross-team (`P3-5` FIMS provider verification) or operational (`P3-4` collector hookup).

## Baseline

| Area | Result | Notes |
|---|---:|---|
| PWA lint | 1 error / 24 warnings | `process` is undefined in `src/utils/renderSanitizationContract.test.js`; Cypress visual-audit warnings are policy-level warnings today. |
| PWA unit tests | 49 passing tests / 20 files | Existing suite passes before Phase 0 changes. |
| PWA production build | Passing | Build completed before this survey. |
| API inventory | 26 resource adapters plus shared API infra | Treat all adapters as not envelope-clean until migrated. |
| Existing untracked files in source checkout | 2 | Preserve `docs/improvement-plan-2026-05-03.md` and `src/utils/renderSanitizationContract.test.js`. |

## API Envelope Readiness Matrix

Classification key:

- `needs migration`: adapter returns raw `response.data` payloads or has bespoke payload parsing.
- `shared helper`: adapter uses `editorialEntityApi.js`; migration starts in the shared helper, then representative adapters are verified.
- `consumer-side audit`: adapter may normalize internally, but store/page consumers still need a quick pass before enabling interceptor auto-unwrap.

| File | Status | Notes |
|---|---|---|
| `src/api/assetsAPI.js` | needs migration | Legacy raw adapter with upload/archive flows. |
| `src/api/blogAPI.js` | shared helper | Uses editorial helper; verify article store/page consumers after helper migration. |
| `src/api/commissionAPI.js` | needs migration | Bespoke singleton adapter with shared error parsing; high-value mutation surface. |
| `src/api/commissionersAPI.js` | shared helper | Uses editorial helper. |
| `src/api/committeesAPI.js` | needs migration | Legacy raw adapter. |
| `src/api/contentManagementAPI.js` | shared helper | Uses editorial helper. |
| `src/api/dashboardAPI.js` | needs migration | Reads raw dashboard payloads. |
| `src/api/directoratesAPI.js` | shared helper | Uses editorial helper. |
| `src/api/editorialEntityApi.js` | needs migration | First Phase 1 target; add shared envelope normalizer here. |
| `src/api/eventsAPI.js` | shared helper | Representative adapter test target after helper migration. |
| `src/api/inquiriesAPI.js` | needs migration | Inquiry submission path also needs idempotency coverage. |
| `src/api/localesAPI.js` | needs migration | Legacy raw adapter. |
| `src/api/noticesAPI.js` | needs migration | Legacy raw adapter. |
| `src/api/officesAPI.js` | shared helper | Uses editorial helper. |
| `src/api/partnersAPI.js` | needs migration | Legacy raw adapter. |
| `src/api/photosAPI.js` | needs migration | Legacy raw adapter with asset-like upload/archive flows. |
| `src/api/publicationsAPI.js` | shared helper | Representative adapter test target after helper migration. |
| `src/api/questionsAPI.js` | shared helper | Uses editorial helper. |
| `src/api/rolesAPI.js` | needs migration | Legacy raw adapter. |
| `src/api/schedulerAPI.js` | needs migration | Legacy raw adapter. |
| `src/api/sectionsAPI.js` | shared helper | Uses editorial helper. |
| `src/api/servicesAPI.js` | shared helper | Uses editorial helper; later server work adds `isCore` and `displayOrder`. |
| `src/api/socialsAPI.js` | needs migration | Legacy raw adapter. |
| `src/api/subscribersAPI.js` | needs migration | Depends on stable server pagination contract. |
| `src/api/unitsAPI.js` | shared helper | Uses editorial helper. |
| `src/api/usersAPI.js` | needs migration | Legacy raw adapter. |
| `src/api/videosAPI.js` | needs migration | Legacy raw adapter. |
| `src/api/visitorsAPI.js` | needs migration | Legacy raw adapter. |

Shared infra files to update in Phase 1:

| File | Status | Notes |
|---|---|---|
| `src/api/interceptors.js` | needs migration | Add gated envelope auto-unwrap later; add Sunset/Deprecation, idempotency, and `traceparent` request behavior now. |
| `src/api/axios.js` | consumer-side audit | Keeps base Axios instance; no direct contract logic expected beyond interceptor registration. |
| `src/api/index.js` | needs migration | Export the new audit adapter. |

## Lint Warning Triage

| Warning group | Count | Decision |
|---|---:|---|
| `cypress/no-unnecessary-waiting` | 18 | Intentional visual-regression stabilization waits in layout and visual audit specs. Convert from recurring warning noise to explicit override policy. |
| `cypress/unsafe-to-chain-command` | 6 | Intentional concise Cypress chains in `cypress/e2e/visual-audit.cy.js`; keep documented as an explicit visual-audit policy unless a failing flow identifies a real bug. |

Phase 0 should end with `npm run lint:check` reporting 0 errors and 0 warnings.

## Vitest Glob

The current Vitest config uses Vitest defaults and excludes `e2e/**`. The existing 49-test suite is discovered correctly, but ESLint's Vitest override only covers `src/**/__tests__/*`. Phase 0 should extend the lint override to `src/**/*.test.js` so Node/Vitest globals are recognized consistently.

## In-Progress Module Dependencies

| Module | Phase 1 dependency | Notes |
|---|---|---|
| Assets / Photos | Envelope sync; idempotency for upload/archive mutations if retried | Existing routes are scaffolded; adapters are legacy raw. |
| Subscribers | Envelope sync | Must align to server pagination envelope before UI completion. |
| Commission | Envelope sync; idempotency for audited mutations | Server mutation audit surface is ready. |
| System module | Audit reader UI; Sunset/Deprecation banner | Audit page should use the real single filtered audit endpoint first. |
| Dashboard & Visitors | Envelope sync; traceparent | Analytics widgets should use normalized payloads and traceable requests. |

## Server Contract Corrections

The implemented audit read contract is a single filtered endpoint, not three separate route families:

`GET /api/v1/admin/audit?userId=&action=&resourceType=&resourceId=&page=&limit=`

PWA Phase 1 should build one filtered audit page/store first. Client-side route aliases for user, resource, or action views can pre-fill filters later.

## Server Prerequisite Survey

| Website content slice | Server status | Phase impact |
|---|---|---|
| `static_pages` admin | Missing as an actual server domain/route aside from docs or seed references. | Schedule server domain before PWA slice. |
| `merger_thresholds` singleton | Missing as an actual server domain/route aside from docs or seed references. | Schedule server domain before PWA slice. |
| `services.isCore` and `services.displayOrder` | Missing from current service schema/API surface. | Add server fields before public ordering UI. |
| `/api/v1/sitemap.xml` | Missing as an actual public route. | Add server route before public website sitemap integration. |

## Infrastructure Survey

The current infrastructure config exposes browser-visible `CMS_API_URL`, `WEBSITE_API_URL`, and `ALLOWED_SITES`. No OTel collector endpoint, Sentry DSN config, or collector service was found in the surveyed infrastructure surface.

Phase 1 infrastructure follow-up:

- Confirm PWA and server same-origin in dev, staging, and production, or document the CORS plan.
- Provision an OTel collector endpoint so PWA `traceparent` propagation links to collected server spans.
- Provision a Sentry DSN before enabling client-side error reporting.

## Phase 0 Exit Criteria

- `npm run lint:check` exits with 0 errors and 0 warnings.
- `npm run test:unit -- --run` remains green with at least 49 tests.
- `npm run build` remains green.

## Phase 1 Execution Notes

- Start with a shared response normalizer.
- Migrate `editorialEntityApi.js` first, then bespoke adapters.
- Keep `VITE_API_ENVELOPE_AUTOUNWRAP` off until every adapter and store/page consumer stops assuming raw top-level payloads.
- Implement audit UI against `GET /api/v1/admin/audit` with query filters and pagination.
- Gate the Sunset/Deprecation banner behind `VITE_SHOW_DEPRECATION_BANNER`.
- Add idempotency and `traceparent` through request interceptors with focused tests.
