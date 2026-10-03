# Production Readiness and Multi-Tenant Hardening

Status: in progress. This document tracks observed implementation gaps; it is not a certification that the system is production-ready.

## Verified repository observations

- The application uses Next.js 16, React 19, Supabase SSR and Supabase Auth.
- `proxy.ts` refreshes auth claims but does not itself enforce route authorization.
- The dashboard resolves an active `school_users` membership and uses its `school_id` for dashboard queries.
- The inspected `school_users_access` RLS policy allowed a user's own membership row to satisfy `USING`, while its `WITH CHECK` did not bind the resulting `user_id` to the caller. A corrective migration now splits read and write policies so membership writes require school-admin or platform-admin authority. This migration is committed to the feature branch only and has not been applied to production.
- `hooks/use-school.ts` currently returns a hard-coded demo school name and address. Do not use it as tenant authority.
- The project includes feature routes for students, staff, admissions, attendance, fees, academics, timetable, homework, exams, notices, communication, reports, leave, users and settings.
- The linked Vercel account currently returns no projects through the connected project listing. Deployment linkage must be verified before claiming an update is live.
- The Supabase security advisor reported executable SECURITY DEFINER functions and disabled leaked-password protection. Review each function's intended caller and internal authorization before changing grants; public staff QR/PIN punching may be a deliberate unauthenticated workflow.
- The inspected CRM database contains an active Ashiana Public School tenant. Do not run destructive resets, truncate data, or merge an unreviewed migration into production.

## Release gates

### Tenant isolation
- Verify every tenant-owned table has a non-null school identifier where appropriate, with foreign keys and indexes.
- Test read, insert, update, delete, RPC and storage access using accounts from two distinct schools.
- Ensure tenant context comes from authenticated membership and database policies, never a client-supplied school selector alone.
- Verify inactive memberships and removed users lose access immediately.
- Verify parent and teacher access is additionally scoped to linked students/classes.

### Authentication and authorization
- Enforce authenticated sessions and role checks on every protected route and server action.
- Validate school membership and active role server-side for each privileged operation.
- Review SECURITY DEFINER functions, fixed search_path, caller checks and EXECUTE grants.
- Enable leaked-password protection and appropriate auth rate limits.
- Keep service-role keys server-only; never commit secrets.

### Data integrity and operations
- Test duplicate admission prevention, fee/payment reconciliation, attendance concurrency and school-local date handling.
- Add audit coverage for sensitive changes without storing secrets or PINs.
- Establish backups, recovery procedure, monitoring and error reporting.
- Confirm privacy, retention, consent and export/deletion processes for student data.

### Deployment
- Confirm the intended Vercel project, Git branch, build command, environment variables and domain.
- Deploy previews first; verify build, login, role routing, mobile layouts and critical workflows.
- Promote only a tested commit. Keep production database migrations backward-compatible and reviewed.
- Run smoke tests after release and retain a rollback path.

## Immediate next implementation work

1. Review and test the new `school_users` membership-write policy migration in an isolated database before any production application.
2. Replace any hard-coded demo tenant context with an authenticated membership-backed server-side tenant resolver.
3. Add a school onboarding request workflow that does not grant tenant-admin privileges until an authorized approval/provisioning step.
4. Add automated cross-tenant authorization tests and a release checklist.
5. Resolve security advisor findings with function-specific least-privilege grants and regression tests.
