# SupplyVault Setup Guide

This guide will help you set up SupplyVault for local development.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Clerk account for authentication

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Database

You have several options for your PostgreSQL database:

### Option A: Vercel Postgres (Recommended for deployment)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new Postgres database
3. Copy the connection string

### Option B: Neon (Free tier available)

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string

### Option C: Supabase (Free tier available)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (use the "Connection string" tab, select "Transaction" mode)

### Option D: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database: `createdb supplyvault`
3. Your connection string will be: `postgresql://postgres:your_password@localhost:5432/supplyvault`

## Step 3: Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your Publishable Key and Secret Key
4. In Clerk Dashboard:
   - Go to "Paths" settings
   - Set Sign-in URL to `/sign-in`
   - Set Sign-up URL to `/sign-up`
   - Set After sign-in URL to `/dashboard`
   - Set After sign-up URL to `/dashboard/onboarding`

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your values:

   ```env
   # Required: Database
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

   # Required: Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # These are already set in .env.example:
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard/onboarding
   ```

## Step 5: Set Up Database Schema

Run Prisma migrations to create the database tables:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate the Prisma Client

## Step 6: (Optional) Seed the Database

If you want to start with some sample data:

```bash
npm run seed
```

## Step 7: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Troubleshooting

### "Can't reach database server" Error

This means your `DATABASE_URL` is not set correctly:

1. Check that `.env.local` exists in the project root
2. Verify the `DATABASE_URL` format is correct
3. Test the connection string using a database client
4. Make sure your database server is running

### Clerk Warnings

If you see warnings about Clerk components:

1. Make sure you've set all the Clerk environment variables
2. Clear your browser cookies and try again
3. Use an incognito window to test fresh sign-in flows

### Redirect Loop on Sign-In

This usually happens when the database records aren't created:

1. Make sure your database is connected
2. Check the server logs for database errors
3. Try signing out and signing in again

### Migration Errors

If Prisma migrations fail:

```bash
# Reset the database (WARNING: This deletes all data!)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev
```

## Next Steps

1. Sign up for an account at `/sign-up`
2. Complete the onboarding process
3. Start adding suppliers and certifications!

## Production Deployment

See [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) for deployment instructions.

## Need Help?

- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
