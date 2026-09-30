# School CRM Supabase

- Project: School-CRM-SaaS
- Project ref: vjztivqyrtvbpcdezbzf
- Region: ap-south-1
- Project URL: https://vjztivqyrtvbpcdezbzf.supabase.co

## Environment variables

Set these in local development and Vercel:

NEXT_PUBLIC_SUPABASE_URL=https://vjztivqyrtvbpcdezbzf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<copy the active publishable key from Supabase>

Never commit a secret/service-role key. Supabase recommends publishable keys for browser/mobile clients and secret keys only for server-controlled components.

## Database foundation

The project currently contains the multi-school tenant foundation, school branding, users/roles, academic years, students, parents, staff, student attendance, staff QR/PIN attendance punches, and audit logs. RLS is enabled on all public CRM tables.
