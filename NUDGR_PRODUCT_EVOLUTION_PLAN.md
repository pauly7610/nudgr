# Nudgr Product Evolution Plan

## North Star

Nudgr should become the fastest way for product, growth, and UX teams to see where users struggle, why it matters, and what to fix next.

The product should evolve from a dashboard of signals into an operating system for product analytics:

- Connect any website or app in minutes.
- Capture behavioral, performance, error, and journey signals automatically.
- Explain friction in plain language.
- Prioritize fixes by revenue, conversion, and customer impact.
- Close the loop with experiments, alerts, exports, and team workflows.

## Phase 1: Local Product Analytics Core

Status: in progress.

Goal: make the local app truthfully reflect live collected data.

- Use SQLite as the default on-device database for local development.
- Keep auth disabled locally with a deterministic demo user.
- Make direct app telemetry, SDK ingest, sample data, summaries, journeys, alerts, and cohorts write/read through the same backend.
- Replace static dashboard defaults with explicit empty states or live aggregates.
- Keep sample generation as an intentional testing tool, not hidden fake production data.

## Phase 2: Connect And Verify

Goal: make onboarding obvious and trustworthy.

- Turn Sites & Apps into the primary setup surface.
- Create one property per website, web app, mobile app, or environment.
- Generate scoped API keys and install snippets.
- Show live verification, last signal time, event volume, and domain allow-list status.
- Add guided setup for npm, script tag, mobile SDK, backend service, and no-code tools.

## Phase 3: Product Intelligence Layer

Goal: turn raw events into product decisions.

- Build first-class entities: sessions, users, pages, funnels, journeys, experiments, and releases.
- Add event taxonomy controls for naming, grouping, and hiding noisy events.
- Derive journey maps from observed paths rather than manual mock journeys.
- Add friction scoring that combines rage clicks, form abandonment, loops, errors, latency, dead clicks, and repeated attempts.
- Add AI explanations over live data with evidence links back to sessions/pages/events.

## Phase 4: Team Workflow

Goal: make Nudgr useful every week, not just interesting once.

- Add alert rules, Slack/email/webhook delivery, and ownership.
- Add issue handoff to Jira, Linear, GitHub, and Notion.
- Add saved views, dashboard sharing, comments, annotations, and change history.
- Add experiment recommendations and A/B test readouts tied to friction reductions.
- Add weekly executive digest with wins, regressions, and highest-impact fixes.

## Phase 5: Production SaaS Hardening

Goal: make it safe to run for real customers.

- Re-enable production auth with Google OAuth plus email/password.
- Add organization/workspace tenancy and role-based access.
- Move production storage back to managed Postgres with migrations.
- Add queue-backed ingestion, batching, retention, rate limits, and abuse protection.
- Add privacy controls: masking, sampling, consent flags, recording redaction, and data deletion.
- Add observability for the platform itself: request traces, ingest lag, dropped events, and storage cost.

## Product Quality Bar

Nudgr should feel top tier when:

- A user can connect a real site in under five minutes.
- The first event appears without a page refresh.
- Empty states tell the user exactly what to do next.
- Every visible number can be traced to real data.
- Every recommendation links to supporting evidence.
- The app distinguishes sample/demo data from production data.
- The interface is calm, dense, and operational rather than decorative.

## Immediate Next Wiring Targets

- Replace mock journey details with session/path-derived actions.
- Replace static cohort/comparison pages with live cohort builders.
- Replace static predictive analytics with backend-derived forecasts.
- Add a real recordings list/player fed by uploaded session recordings.
- Add property-scoped filters to every analytics endpoint and every dashboard tab.
- Add e2e browser coverage for connect, ingest, summary, realtime, and dashboard rendering.
