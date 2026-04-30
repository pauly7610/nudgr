# Nudgr Local Grade Report

Date: 2026-04-29
Repository: https://github.com/pauly7610/nudgr
Local path: C:\Users\PaulC\Downloads\development\nudgr
Commit reviewed: a95bfc57a28524dde332710abc3baa521f409b4e

## Overall Grade

Overall: B- / 72

This is a broad and ambitious full-stack prototype with a large React dashboard, a Fastify/Prisma backend, real ingestion paths, auth, API keys, exports, realtime updates, docs, and some meaningful tests. It is above a throwaway demo, but it is not production-ready yet. The main drag on the grade is reliability and hardening: lint fails, dependency audit has high/critical issues, refresh auth is incomplete on the frontend, the tracker has logic/privacy concerns, and many product surfaces still rely on mock data.

Production readiness: C+ / 67
Prototype/product breadth: A- / 90
Maintainability: B- / 72
Security posture: C / 62
Test confidence: B- / 70

## Pull And Setup Result

- The original folder was empty and not a Git repository, so the repo was cloned from GitHub into the requested local folder.
- `git pull --ff-only`: already up to date.
- Working branch: `main`.
- Latest commit reviewed: `a95bfc57` (`sorting CLI`, committed 2026-03-09).
- Installed dependencies with `npm ci` in both root and `backend/`.
- Generated Prisma Client with `npm run prisma:generate` in `backend/` so backend tests could run.

## Automated Checks

| Check | Result | Notes |
| --- | --- | --- |
| Root `npm run typecheck` | Pass | Frontend and Vite config TypeScript compile. |
| Root `npm test` | Pass | 6 files, 17 tests passed. |
| Root `npm run build` | Pass with warnings | Main JS chunk is 1,495.56 kB minified; Browserslist data is stale. |
| Root `npm run lint` | Fail | 51 errors, 11 warnings. Mostly `any`, CommonJS `require`, hook dependency warnings, and shadcn-style export warnings. |
| Backend `npm run typecheck` | Pass | Backend TypeScript compiles. |
| Backend `npm run build` | Pass | `tsc -p tsconfig.json` succeeds. |
| Backend `npm run lint` | Fail | 2 `any` errors in `backend/src/plugins/auth.ts`. |
| Backend `npm test` | Pass after setup | Initially failed because Prisma Client was not generated; passed 16 tests after `npm run prisma:generate`. |
| Root `npm audit` | Fail | 19 vulnerabilities: 2 low, 8 moderate, 9 high. |
| Backend `npm audit` | Fail | 12 vulnerabilities: 1 moderate, 10 high, 1 critical. |

## Strengths

- The project has real architecture depth: frontend dashboard, backend API, Prisma schema, Supabase functions, storage upload paths, PDF export, realtime websocket route, and tracking SDK.
- TypeScript build health is reasonably good: both frontend and backend typechecks pass despite loose compiler settings.
- Backend auth/SDK behavior has useful tests, especially around refresh token rotation, route guards, SDK sessions, and multipart uploads.
- API key hashing and origin/domain restrictions are present in the ingestion flow.
- Documentation volume is strong, with API, architecture, installation, monitoring, rate limiting, and security docs.
- UI coverage is broad: dashboard, metrics, journey mapping, cohorts, alerts, exports, settings, onboarding, API keys, billing, monitoring, and security views.

## Major Findings

1. Lint is not currently green.

   Root lint reports 51 errors and 11 warnings. Backend lint reports 2 errors. This is not just style noise; it includes weak typing in auth, `require()` usage, empty interfaces, React hook dependency warnings, and lint failures in tests and Supabase functions.

2. Dependency security needs urgent attention.

   The backend audit includes a critical `fast-jwt` advisory through `@fastify/jwt`, plus high-severity advisories in Fastify, Prisma-related packages, AWS XML parsing, and tooling dependencies. The frontend audit includes high-severity advisories in React Router, Rollup, Lodash, Glob, Flatted, Picomatch, and others.

3. Refresh token support is only half-wired.

   The backend returns `refreshToken` from signup/login, but `src/pages/Auth.tsx` only stores the access token at lines 83 and 135. The frontend does not persist the refresh token, call `/auth/refresh`, retry expired requests, or send the refresh token to `/auth/logout`. Users will silently fall out once the short access token expires.

4. `JWT_REFRESH_SECRET` is configured but not used for refresh tokens.

   `backend/src/config/env.ts` requires `JWT_REFRESH_SECRET`, but refresh tokens are signed and verified through the same Fastify JWT instance that is configured with `JWT_ACCESS_SECRET` in `backend/src/plugins/auth.ts`. This weakens token separation and makes the config misleading.

5. `apiRequest` breaks multipart uploads.

   `src/lib/apiClient.ts` sets `Content-Type: application/json` for any request with a body. `src/hooks/useFileStorage.ts` sends `FormData` through that helper, which means browser multipart boundaries will not be set correctly. The public tracker avoids this by using raw `fetch`, but the React upload hooks are fragile.

6. Default frontend API base can point to the Vite app instead of the backend.

   `src/lib/apiClient.ts` falls back to `window.location.origin`. In local dev with Vite, `/auth/me` can hit the frontend server and return HTML instead of JSON. The README says to set `VITE_API_BASE_URL`, but there is no root `.env.example` making that setup obvious.

7. Much of the product is still mock-driven.

   Many dashboard, journey, cohort, analytics, session recording, and metrics components import `src/data/mockData.ts` or embed mock arrays. That is fine for demos, but it means the user-facing dashboard can look more complete than the backend integration really is.

8. The tracking SDK has correctness and privacy risks.

   `public/friction-tracker.js` uses `hasPageChanged()` as `performance.now()`, so dead-click detection is effectively broken. It snapshots `document.documentElement.outerHTML` up to 50 KB, which can capture sensitive DOM content. It also loads `html2canvas` from a CDN at runtime and uses async fetch in `beforeunload`, which is unreliable for final event delivery.

9. TypeScript strictness is disabled.

   `tsconfig.app.json` has `strict: false`, `noImplicitAny: false`, and unused checks disabled. That explains how the app can typecheck while lint still finds many weak spots.

10. Documentation is useful but not fully repo-specific.

   `README.md` still references `yourusername/friction-analytics`, missing docs like `docs/PRE_LAUNCH_CHECKLIST.md`, and Lovable support links. It also contains mojibake/encoding artifacts in headings and diagrams.

## Recommended Next Fixes

1. Make CI genuinely green: fix root/backend lint, add `prisma generate` to backend setup or postinstall, and run backend tests in CI after generation.
2. Upgrade vulnerable dependencies, starting with backend auth stack (`@fastify/jwt` / `fast-jwt`) and Fastify, then React Router/Rollup/Vite frontend advisories.
3. Complete the refresh-token client flow: store refresh token securely, refresh on 401/expiry, rotate stored token, and revoke it on logout.
4. Split access and refresh token signing/verification so `JWT_REFRESH_SECRET` is actually used.
5. Update `apiRequest` so it does not force JSON content type for `FormData`.
6. Add a root `.env.example` and fail loudly when `VITE_API_BASE_URL` is missing in local development.
7. Replace mock dashboard data with backend-backed queries, or label demo-only surfaces clearly.
8. Harden the tracker SDK: fix dead-click detection, use `crypto.randomUUID`, use `sendBeacon` or `fetch(..., { keepalive: true })` for unload, reduce DOM capture scope, and add privacy redaction.
9. Enable stricter TypeScript incrementally, starting with `noImplicitAny` and better auth/request types.
10. Clean up README links, encoding artifacts, package-manager confusion, and references to missing docs.

## Bottom Line

Nudgr has a strong skeleton and a surprisingly large feature surface for a young product. The foundation is workable, and the backend is closer to real than the frontend suggests. The next phase should be less about adding features and more about making the existing paths honest, secure, and repeatable: green CI, dependency upgrades, real data wiring, refresh auth, and tracker hardening.
