# Apartment War Room

A simple shared apartment/condo decision board for Stephen and Stephanie.

Built as a free-tier-friendly Vite app with Supabase Auth, Supabase Postgres, Supabase Storage, and Vercel deployment.

## What it does

- View all listings
- Add a new listing
- Edit existing listings
- Upload or change listing images/screenshots
- Change status: To Call, Contacted, Tour Scheduled, Toured, Rejected, Finalist, Crossed Off
- Preserve pipeline counts
- Keep crossed-off listings visible as search history
- Use Supabase Auth so Stephen and Stephanie can share one synced board

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Add these values to `.env`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit `.env` or a Supabase service role key.

## Supabase setup

1. Create a Supabase project.
2. Open `supabase/schema.sql`.
3. Replace `STEPHANIE_EMAIL_HERE` with Stephanie's actual email.
4. Run the SQL in Supabase SQL Editor.
5. Go to Authentication > Providers > Email and enable email login/magic links.
6. Confirm the `listing-images` Storage bucket exists and is public.

## Vercel setup

In Vercel project settings, add environment variables:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Then deploy from GitHub.

## First live use

After Supabase env vars are configured and you sign in, the app starts empty. Click **Load starter board** once to insert the initial War Room leads.

## MVP principle

Persistence and shared editing first. Pretty second.
