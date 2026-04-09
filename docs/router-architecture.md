# FCC CMS PWA Router Architecture

## Overview

The router is assembled in [`src/router/index.js`](../src/router/index.js). It combines:

- `authRoutes`
- `moduleRoutes`
- `errorRoutes`

The history implementation comes from [`src/router/history`](../src/router/history), and a global `scrollBehavior` resets the main page position on every navigation.

## Route Composition

The main application surface is modular. [`src/router/modules/index.js`](../src/router/modules/index.js) exports one route tree per domain:

- dashboard and system
- governance and organization
- content and publications
- communication and outreach
- assets and media
- users and access control

Each module file defines a top-level path, usually mounted inside [`CmsLayout.vue`](../src/router/layouts/CmsLayout.vue), then nests list, create, detail, edit, archive, review, schedule, and usage routes underneath it.

Examples:

- Publications and publication categories are grouped together in [`publicationsRoutes.js`](../src/router/modules/publicationsRoutes.js)
- Content-management submodules live under [`contentManagementRoutes.js`](../src/router/modules/contentManagementRoutes.js)
- Photos and assets use separate module files so navigation stays explicit instead of hiding media flows inside generic routes

## Layout Strategy

The router intentionally separates authenticated shell routes from auth/error routes:

- Public auth flows render outside the CMS shell
- Most back-office routes render inside `CmsLayout`
- Feature pages receive their own nested context through route params such as `:publicationId`, `:categoryId`, `:photoId`, and `:assetId`

This keeps the shell stable while detail/edit/workflow screens swap only inside the main content outlet.

## Metadata and Navigation

The router relies heavily on `meta`:

- `meta.nav` powers sidebar generation
- `meta.breadcrumb` powers breadcrumb rendering
- `meta.page` powers page titles and document title updates
- `meta.type` identifies list/details/create/edit/history/review/archive/schedule surfaces
- `meta.allowedStates`, `meta.roles`, and permission metadata help route guards make workflow-aware decisions

Sidebar items are built from route metadata through:

- [`buildNavigation.js`](../src/navigation/buildNavigation.js)
- [`buildSidebar.js`](../src/navigation/buildSidebar.js)

That means navigation is declarative: adding a route with correct `meta.nav` is usually enough to place it in the CMS sidebar.

## Guard Pipeline

Global guards are registered in this order:

1. `authGuard`
2. `roleGuard`
3. `permissionGuard`
4. `workflowGuard`

This order is important:

- authentication is checked first
- coarse role checks happen before fine-grained permissions
- workflow state constraints are applied last, when route and user context are already known

## Lazy Loading

Most page components are lazy-loaded with dynamic imports. This keeps the initial bundle smaller and matches the module-by-module structure of the CMS.

The result is closer to an enterprise workspace than a flat SPA:

- module boundaries are obvious
- detail routes can carry their own lifecycle tools
- archive/review/schedule pages stay discoverable without bloating first load

## Strengths

- Clear module boundaries by domain
- Strong use of nested routes for contextual workflows
- Declarative sidebar and breadcrumb wiring from route metadata
- Guard layering is explicit and easy to reason about
- Publications/categories routing already models parent-child editorial relationships well

## Improvements Implemented

This refactor keeps the architecture but improves usability around it:

- publications and publication categories remain grouped, but the UI now exposes both as first-class destinations
- scheduling remains a dedicated nested route instead of being mixed into edit forms
- media upload routes now open PR-friendly upload workspaces instead of technical action placeholders
- content-management subroutes now render more editorial surfaces and less developer-centric payload editing

## Recommended Next Improvements

1. Introduce a small typed route-meta helper so `nav`, `page`, and `breadcrumb` shapes stay consistent across modules.
2. Extract shared child-route factories for common CRUD patterns to reduce repetitive route definitions.
3. Add route-level feature flags for modules still under redesign, instead of relying only on permission visibility.
4. Separate "content operations" and "reference management" in navigation if the sidebar grows much further.
5. Add route tests for critical named routes used by dashboard shortcuts so future renames do not silently break navigation.
