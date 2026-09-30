# SchoolConnect CRM Architecture
Multi-tenant SaaS: Next.js web + Expo mobile + Supabase PostgreSQL/Auth/Storage/RLS + Vercel hosting.

Every tenant-owned record must contain school_id. Authorization must be enforced by Supabase RLS, not frontend visibility alone.