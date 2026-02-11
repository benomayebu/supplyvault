# Onboarding Flow Configuration Guide

This guide explains the complete onboarding flow and how to configure it correctly for production deployment.

## Overview

The SupplyVault onboarding flow has three main stages:

1. **User Sign-Up** → Handled by Clerk
2. **Role Selection** → User chooses "Supplier" or "Brand"
3. **Profile Creation** → User fills out profile form and database record is created
4. **Dashboard Access** → Protected by database-based layout guards

## How It Works

### Stage 1: Sign-Up (Clerk)

```
User clicks "Sign Up"
  → Clerk handles authentication
  → Clerk redirects to /onboarding (configured in Clerk Dashboard)
```

### Stage 2: Role Selection (`/onboarding`)

```
/onboarding page
  → User selects "Supplier" or "Brand"
  → Updates Clerk unsafeMetadata: { stakeholderRole: "SUPPLIER" | "BRAND" }
  → Redirects to:
     - /onboarding/supplier (if Supplier)
     - /onboarding/brand (if Brand)
```

**Auto-redirect for completed users:**
- If `onboardingComplete: true` in metadata, redirects to appropriate dashboard
- Prevents re-onboarding

### Stage 3: Profile Creation

#### For Suppliers (`/onboarding/supplier`)

```
User fills form (name, country, type, etc.)
  → Submits to POST /api/suppliers/create
  → API creates Supplier record with clerk_user_id
  → Updates Clerk metadata: { onboardingComplete: true }
  → Redirects to /supplier/dashboard
```

#### For Brands (`/onboarding/brand`)

```
User fills form (company name, email, country, etc.)
  → Submits to POST /api/brands/create
  → API creates Brand record with clerk_user_id
  → API creates User record (ADMIN role) for the brand
  → Updates Clerk metadata: { onboardingComplete: true }
  → Redirects to /brand/dashboard
```

**Conflict Handling (409):**
- If profile already exists, API returns 409
- Frontend redirects to appropriate dashboard
- Prevents duplicate profiles

### Stage 4: Dashboard Access (Layout Guards)

The app uses **database-based layout guards** instead of JWT session claims.

#### Supplier Layout (`/app/supplier/layout.tsx`)

```typescript
const supplier = await prisma.supplier.findUnique({
  where: { clerk_user_id: userId }
});

if (!supplier) {
  redirect("/onboarding");
}
```

#### Brand Layout (`/app/brand/layout.tsx`)

```typescript
const brand = await prisma.brand.findUnique({
  where: { clerk_user_id: userId }
});

if (!brand) {
  redirect("/onboarding");
}
```

**Why database-based guards?**
- Avoids dependency on Clerk JWT session claims configuration
- Single source of truth (database)
- Works even if Clerk Dashboard session token customization is not configured

## Required Configuration

### 1. Vercel Environment Variables

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

```bash
# Database - BOTH are required
DATABASE_URL=postgresql://user:pass@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require

# Clerk - Use production keys for production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Clerk redirects (optional - defaults work)
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
```

### 2. Clerk Dashboard Configuration

**Go to https://dashboard.clerk.com → Your Application**

#### Paths/URLs Configuration

Navigate to **Paths** (or **URLs** depending on your Clerk version):

| Setting | Value | Why |
|---------|-------|-----|
| After sign-up URL | `/onboarding` | Directs new users to role selection |
| After sign-in URL | `/onboarding` | Auto-redirects completed users to dashboard |

#### Session Token (No Configuration Needed)

Navigate to **Sessions → Customize session token**:

- **No changes needed** - Leave default
- The app doesn't rely on custom JWT claims
- Database guards provide authorization

#### API Keys Verification

Navigate to **API Keys**:

- Verify keys match what's in Vercel
- Use `pk_live_...` and `sk_live_...` for production
- Use `pk_test_...` and `sk_test_...` for development

### 3. Database Configuration

**IMPORTANT**: The layout guards query the database on every protected route access.

**What you need:**

1. **Neon PostgreSQL** (recommended for Vercel)
2. **Two connection strings:**
   - **Pooled** (with `-pooler`) → for `DATABASE_URL`
   - **Direct** (without `-pooler`) → for `DIRECT_URL`

**Why both?**
- `DATABASE_URL` (pooled) → Used by Vercel serverless functions
- `DIRECT_URL` (direct) → Required for Prisma migrations and schema operations

**Get connection strings:**
1. Go to Neon Console (https://console.neon.tech)
2. Navigate to your project
3. Copy connection string
4. Create two versions:
   ```
   Pooled:  postgresql://user:pass@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   Direct:  postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

## Testing the Flow

### Test Case 1: New Supplier

1. Sign up at `/sign-up`
2. Verify redirect to `/onboarding`
3. Select "Supplier"
4. Verify redirect to `/onboarding/supplier`
5. Fill form and submit
6. Verify redirect to `/supplier/dashboard`
7. Verify dashboard loads (not redirected back to onboarding)

### Test Case 2: New Brand

1. Sign up at `/sign-up`
2. Verify redirect to `/onboarding`
3. Select "Brand"
4. Verify redirect to `/onboarding/brand`
5. Fill form and submit
6. Verify redirect to `/brand/dashboard`
7. Verify dashboard loads (not redirected back to onboarding)

### Test Case 3: Returning User

1. Sign in with existing account (already onboarded)
2. Verify redirect to `/onboarding`
3. **Auto-redirect** should happen to appropriate dashboard
4. Verify dashboard loads

### Test Case 4: Duplicate Profile

1. Complete onboarding
2. Manually navigate to `/onboarding/supplier` or `/onboarding/brand`
3. Try to submit form again
4. Should get 409 conflict
5. Should redirect to dashboard

## Troubleshooting

### Issue: Infinite redirect loop (onboarding ↔ dashboard)

**Cause**: Database connection issue - layout guards can't query database

**Fix**:
1. Check `DATABASE_URL` is set correctly in Vercel
2. Verify it points to Neon (not `db.prisma.io` Prisma Data Proxy)
3. Check database is accessible from Vercel
4. Review Vercel function logs for connection errors

### Issue: After sign-up, not redirected to `/onboarding`

**Cause**: Clerk redirect URL not configured

**Fix**:
1. Go to Clerk Dashboard → Paths
2. Set "After sign-up URL" to `/onboarding`
3. Deploy and test again

### Issue: Profile created but dashboard shows error

**Cause**: Database record not created or clerk_user_id mismatch

**Fix**:
1. Check API route logs (`/api/suppliers/create` or `/api/brands/create`)
2. Verify `clerk_user_id` matches authenticated user
3. Check database directly for record

### Issue: User can access dashboard without onboarding

**Cause**: Layout guard not working or database query failing

**Fix**:
1. Check layout files (`app/supplier/layout.tsx`, `app/brand/layout.tsx`)
2. Verify database connection
3. Check Vercel function logs for errors

## Security Notes

### Database Password Exposure

If you've shared your database password:

1. Go to Neon Console → Project Settings
2. Reset database password
3. Update `DATABASE_URL` and `DIRECT_URL` in Vercel
4. Redeploy

### Environment Variable Best Practices

- Never commit `.env`, `.env.local`, or `.env.production` to git
- Use `.env.example` and `.env.production.example` as templates
- Rotate secrets regularly
- Use different keys for production vs development

## Architecture Decisions

### Why Database Guards Instead of JWT Claims?

**Pros:**
- Single source of truth (database)
- No Clerk Dashboard configuration required
- Works immediately after deployment
- Easier to debug (just check database)

**Cons:**
- Additional database query on every request
- Slightly slower than reading from JWT

**Conclusion:** For this application, the pros outweigh the cons. The query is simple and cached by Prisma.

### Why Separate Onboarding Pages?

Each stakeholder type (Supplier vs Brand) has different:
- Required fields
- Database schemas
- Dashboard features
- Business logic

Separating the onboarding flows makes the code cleaner and easier to maintain.

## Related Files

- `/app/onboarding/page.tsx` - Role selection
- `/app/onboarding/supplier/page.tsx` - Supplier profile creation
- `/app/onboarding/brand/page.tsx` - Brand profile creation
- `/app/api/suppliers/create/route.ts` - Supplier API
- `/app/api/brands/create/route.ts` - Brand API
- `/app/supplier/layout.tsx` - Supplier guard
- `/app/brand/layout.tsx` - Brand guard
- `/middleware.ts` - Auth middleware
- `/lib/db.ts` - Database client
- `/prisma/schema.prisma` - Database schema
