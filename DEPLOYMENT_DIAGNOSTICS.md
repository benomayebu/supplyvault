# SupplyVault Deployment Diagnostics Guide

## Critical Issues Found and Fixed

### ✅ Issue #1: Root Page Showing Default Next.js Template
**Problem**: The root page (`app/page.tsx`) was displaying the default Next.js template instead of the SupplyVault application.

**Fix**: Updated `app/page.tsx` to:
- Redirect authenticated users to `/dashboard`
- Show a proper landing page for unauthenticated users with sign-up/sign-in links
- Match SupplyVault branding and design

**Status**: ✅ Fixed

---

## Common Deployment Issues Checklist

### 1. Environment Variables

**Required Variables in Vercel:**

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... or pk_live_...
CLERK_SECRET_KEY=sk_test_... or sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# AWS S3
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Resend Email API
RESEND_API_KEY=re_...

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Check**: Go to Vercel Dashboard → Your Project → Settings → Environment Variables

---

### 2. Database Setup

**Steps:**
1. Create production PostgreSQL database (Supabase, Neon, or Vercel Postgres)
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Verify connection:
   - Check `DATABASE_URL` format
   - Test connection from Vercel deployment logs

**Common Issues:**
- ❌ Missing `DATABASE_URL` → App will fail on database queries
- ❌ Wrong connection string format → Connection errors
- ❌ Database not accessible from Vercel IP → Connection timeout

---

### 3. Clerk Configuration

**Required Setup:**
1. **Application Keys**: Add publishable and secret keys to Vercel env vars
2. **Webhook**: Configure webhook endpoint in Clerk Dashboard
   - URL: `https://your-app.vercel.app/api/webhooks/clerk`
   - Events: `user.created`, `user.deleted`
   - Copy signing secret to `CLERK_WEBHOOK_SECRET`

**Common Issues:**
- ❌ Missing `CLERK_SECRET_KEY` → Authentication won't work
- ❌ Missing `CLERK_WEBHOOK_SECRET` → Users won't be created in database
- ❌ Wrong webhook URL → Webhook fails silently

---

### 4. API Routes Not Working

**Check These Routes:**

1. **Authentication**: `/api/webhooks/clerk` (POST)
   - Should create Brand and User records on sign-up
   - Check Vercel function logs for errors

2. **Dashboard Data**: `/api/alerts`, `/api/suppliers`, etc.
   - Check if `getCurrentBrand()` returns null
   - Verify database has Brand records

3. **File Upload**: `/api/upload` (POST)
   - Verify AWS credentials are set
   - Check S3 bucket permissions

**Debugging:**
- Check Vercel deployment logs: Dashboard → Deployments → Click deployment → Functions tab
- Check browser console for API errors
- Verify API routes have proper error handling

---

### 5. Build Errors

**Common Build Issues:**

1. **TypeScript Errors**:
   ```bash
   npm run type-check
   ```
   Fix all TypeScript errors before deploying

2. **Missing Dependencies**:
   ```bash
   npm install
   ```
   Ensure `package.json` has all required dependencies

3. **Environment Variable Access**:
   - Only `NEXT_PUBLIC_*` variables are available in client components
   - Server-only variables must be accessed in API routes or server components

---

### 6. Database Migrations

**Run Migrations After Deployment:**

```bash
# In Vercel dashboard, use CLI or run locally with production DATABASE_URL
npx prisma migrate deploy
```

**Or use Vercel's Postgres:**
- Migrations run automatically if using Vercel Postgres
- Otherwise, run manually after first deployment

---

## Step-by-Step Deployment Verification

### Step 1: Verify Build Succeeds
```bash
npm run build
```
Should complete without errors.

### Step 2: Check Environment Variables
- All required variables are set in Vercel
- No typos in variable names
- Values are correct (no trailing spaces)

### Step 3: Test Authentication Flow
1. Visit root URL → Should redirect to `/dashboard` if signed in, or show landing page
2. Click "Sign Up" → Should create account in Clerk
3. Check Clerk webhook → Should create Brand and User in database
4. After sign-up → Should redirect to `/dashboard/onboarding`

### Step 4: Test Dashboard
1. Navigate to `/dashboard`
2. Should see dashboard with metrics (even if 0)
3. Should see sidebar navigation
4. No console errors

### Step 5: Test Core Features
1. **Add Supplier**: `/dashboard/suppliers` → Click "Add Supplier"
2. **Upload Certification**: Click on supplier → "Upload Certification"
3. **View Alerts**: `/dashboard/alerts`
4. **Settings**: `/dashboard/settings`

---

## Debugging in Production

### Check Vercel Logs

1. **Function Logs**:
   - Vercel Dashboard → Your Project → Deployments
   - Click on deployment → Functions tab
   - Look for errors or warnings

2. **Build Logs**:
   - Check build output for errors
   - Verify all dependencies install correctly

3. **Runtime Logs**:
   - Use `console.log()` in API routes
   - Check logs in real-time during requests

### Common Error Patterns

**"Unauthorized" or 401 Errors:**
- Check if `getCurrentBrand()` returns null
- Verify Clerk authentication is working
- Check if Brand record exists in database

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Verify connection pool limits

**404 Errors on Routes:**
- Check route file paths match URL structure
- Verify dynamic routes use correct param names
- Check middleware isn't blocking routes

**Empty Pages or Missing Data:**
- Check API routes return data correctly
- Verify database queries work
- Check for errors in browser console

---

## Quick Fixes for Common Issues

### Issue: "Cannot see application features"

**Possible Causes:**
1. ❌ Root page showing default template (FIXED)
2. ❌ Not authenticated → redirect to sign-in
3. ❌ No Brand record → redirect to onboarding
4. ❌ Database connection failing → API routes return errors
5. ❌ Environment variables missing → features fail silently

**Solution:**
1. ✅ Root page now redirects properly (FIXED)
2. Sign in/sign up to create account
3. Complete onboarding to create Brand record
4. Check environment variables are set
5. Verify database is connected

### Issue: "Page shows loading forever"

**Possible Causes:**
- API route is failing
- Database query is slow or timing out
- Missing error handling

**Solution:**
- Check browser console for errors
- Check Vercel function logs
- Add error boundaries and loading states

### Issue: "Features don't work"

**Check:**
1. Browser console for JavaScript errors
2. Network tab for failed API requests
3. Vercel logs for server-side errors
4. Environment variables are set correctly

---

## Testing Checklist

- [ ] Build succeeds locally (`npm run build`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] All environment variables are set in Vercel
- [ ] Database migrations are run
- [ ] Can sign up new user
- [ ] Can sign in existing user
- [ ] Dashboard loads with metrics
- [ ] Can add supplier
- [ ] Can upload certification
- [ ] Can view alerts
- [ ] Can access settings
- [ ] File uploads work (S3)
- [ ] Email sending works (Resend)
- [ ] Webhooks are configured

---

## Next Steps After Deployment

1. **Monitor Logs**: Check Vercel logs regularly for errors
2. **Test User Flows**: Complete end-to-end user journeys
3. **Set Up Monitoring**: Consider adding error tracking (Sentry, etc.)
4. **Configure Custom Domain**: Add your domain in Vercel settings
5. **Set Up Cron Job**: Verify `/api/cron/check-expiries` runs daily
6. **Backup Database**: Set up regular database backups

---

## Getting Help

If issues persist:
1. Check Vercel deployment logs
2. Check browser console errors
3. Verify all environment variables
4. Test API routes individually
5. Check database connection
6. Review this diagnostics guide

