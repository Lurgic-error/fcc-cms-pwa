# FCC CMS PWA Feature Checklist (Actors + Status)

## Actor Catalog

| Actor | Primary Responsibility | Access Model |
| --- | --- | --- |
| System Admin | Platform governance, system setup, highest-level control | `system admin` role |
| Admin | User/role governance, approvals, archive, critical module control | `admin` role |
| Editor | Create and edit content records, draft management | `editor` role |
| Reviewer | Review queue decisions and quality/compliance checks | `reviewer` role |
| Publisher | Publishing and scheduling decisions | `publisher` role |
| Communications Staff | Social, subscribers, partner and inquiry handling | role/permission based |
| Internal Operations Staff | Governance structure and service ownership maintenance | role/permission based |
| Guest (Unauthenticated) | Login, password recovery only | guest-only routes |

## Implemented

| Domain | Feature / Functionality | Actors | State |
| --- | --- | --- | --- |
| Authentication | Login, logout, refresh token, forgot/reset password | Guest, All Authenticated | Implemented |
| Authorization | Route guards: auth, role, permission | Admin, System Admin, Role-based users | Implemented |
| Session | Persisted session in local storage + interceptor token handling | All Authenticated | Implemented |
| Internationalization | Locale switching (EN/SW), i18n route/page labels | All Authenticated | Implemented |
| UI Foundation | Element Plus + TailwindCSS component architecture | All Authenticated | Implemented |
| UI Auto Import | Resolver-based Element Plus component/directive auto import | Engineering Platform | Implemented |
| Navigation | Sidebar/topbar/breadcrumb navigation by route metadata | All Authenticated | Implemented |
| Enterprise CRUD Shell | Shared `ResourceListPage`, `ResourceDetailsPage`, `ResourceFormPage` | Admin, Editor, Reviewer, Publisher | Implemented |
| Enterprise Action Shell | Shared `ResourceActionPage` for non-CRUD routes | Admin, Editor, Reviewer, Publisher | Implemented |
| Users Module | List/create/details/edit flows via resource-config adapter | Admin, System Admin | Implemented |
| Roles Module | List/create/details/edit flows via resource-config adapter | Admin, System Admin | Implemented |
| Publications Module | List/create/details/edit + workflow routes scaffolded | Editor, Reviewer, Publisher, Admin | Implemented |
| Publication Categories Module | List/create/details/edit + workflow routes scaffolded | Editor, Reviewer, Publisher, Admin | Implemented |
| Events Module | List/create/details/edit + schedule/review/archive routes | Editor, Reviewer, Publisher, Admin | Implemented |
| Governance Modules | Directorates/sections/units/offices CRUD + action routes | Internal Operations Staff, Admin | Implemented |
| Leadership Modules | Commissioners/committees CRUD + assignment/membership routes | Internal Operations Staff, Admin | Implemented |
| Services Module | Services CRUD + ownership route | Internal Operations Staff, Admin | Implemented |
| Questions Module | FAQ CRUD + review/history routes | Editor, Reviewer, Admin | Implemented |
| Social Accounts Module | Social CRUD + publishing-rules route | Communications Staff, Admin | Implemented |
| Partners Module | Partners CRUD + agreements route | Communications Staff, Admin | Implemented |
| Inquiries Module | Inquiries CRUD + response/assignment/history routes | Communications Staff, Reviewer, Admin | Implemented |
| Route Performance | Route-level lazy loading + manual chunk strategy | All Authenticated | Implemented |
| Testing | Cypress auth/role-access spec wired to `fcc-cms-server` | QA, Engineering Platform | Implemented |
| Workflow State Enforcement | Guard now evaluates record state from module adapters for `allowedStates` | Reviewer, Publisher, Admin | Implemented |
| Module E2E Coverage | Cypress module-resource flow suite for assets/photos/subscribers/commission/dashboard/system | QA, Engineering Platform | Implemented |

## In Progress

| Domain | Feature / Functionality | Actors | State |
| --- | --- | --- | --- |
| Assets Module | Library/details migrated to `ResourceListPage`/`ResourceDetailsPage`; upload/usage/archive remain action routes | Editor, Admin | In Progress |
| Photos Module | List/details migrated to `ResourceListPage`/`ResourceDetailsPage`; upload/usage/archive remain action routes | Editor, Admin | In Progress |
| Subscribers Module | List/details migrated to `ResourceListPage`/`ResourceDetailsPage` with segments route; server endpoint parity still maturing | Communications Staff, Admin | In Progress |
| Commission Module | Singleton commission adapter/config wired for details/edit/history action routes; full edit-form parity pending | Admin, System Admin | In Progress |
| System Module | Activity log/audit/workflow monitor/scheduled jobs/settings UI scaffold | System Admin, Admin | In Progress |
| Dashboard & Visitors | Summary/analytics plus visitor heatmap route scaffolded; richer analytics widgets pending | Admin, System Admin | In Progress |

## Planned

| Domain | Feature / Functionality | Actors | State |
| --- | --- | --- | --- |
| Full Module Parity | Complete parity migration from `fcc-cms-front` for all remaining modules | All Authenticated | Planned |
| Schema Platform | Expand centralized form schema/data-grid config for all modules | Engineering Platform | Planned |
| Workflow Automation | Full submit/approve/reject/publish/archive action pipelines per module | Reviewer, Publisher, Admin | Planned |
| Advanced Media Management | Complete asset/photo ingestion, lifecycle and usage dependency tooling | Editor, Admin | Planned |
| Enterprise Auditability | Deeper immutable activity trails and cross-module audit correlation | System Admin, Compliance, Admin | Planned |
| Multi-language Authoring | Per-locale content entry + validation at module level | Editor, Publisher, Admin | Planned |
| Notification Integrations | Workflow notifications (review, publish, archive, SLA) | Reviewer, Publisher, Admin | Planned |
| Quality Gates | Broader unit/integration/e2e matrix and CI gates | QA, Engineering Platform | Planned |
| PWA Hardening | Offline strategy, installability tuning, runtime caching controls | All Authenticated | Planned |
