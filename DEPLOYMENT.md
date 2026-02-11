# SupplyVault Production Deployment Guide

This guide covers deploying SupplyVault to Vercel production.

## Prerequisites

- ✅ GitHub repository with SupplyVault code
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ PostgreSQL database (Supabase, Neon, or similar)
- ✅ Clerk account for authentication
- ✅ AWS account for S3 storage
- ✅ Resend account for email sending

## Step 1: Pre-Deployment Checks

### Run Type Checking
```bash
npm run type-check
```

### Run Linting
```bash
npm run lint
```

### Test Production Build Locally
```bash
npm run build
npm run start
```

Visit `http://localhost:3000` and verify everything works.

## Step 2: Set Up Vercel Project

### 2.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository containing SupplyVault

### 2.2 Configure Project Settings

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `supplyvault` (if monorepo) or `.` (if root)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 2.3 Configure Build Settings

The project uses the default Next.js build settings. No custom configuration needed.

## Step 3: Environment Variables

Add the following environment variables in Vercel Dashboard → Project Settings → Environment Variables:

### Required Variables

```bash
# Database - Use Neon with both pooled and direct connections
# IMPORTANT: Use pooled connection for DATABASE_URL (with -pooler)
# and direct connection for DIRECT_URL (without -pooler)
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:PASSWORD@ep-xxxxx.REGION.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication - Use production keys for production environment
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# AWS S3 (Optional - only if using S3 for document storage)
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Email (Optional - only if using email notifications)
RESEND_API_KEY=re_...
```

### Environment-Specific Variables

Add these to **Production**, **Preview**, and **Development** environments as needed.

**Note**: Use different Clerk keys for production vs preview environments.

### 3.4 Clerk Dashboard Configuration

After adding environment variables, configure your Clerk dashboard:

1. **Go to Clerk Dashboard** (https://dashboard.clerk.com)
2. **Navigate to your application**
3. **Configure redirect URLs in Paths (or URLs)**:
   - **After sign-up URL**: `/onboarding`
   - **After sign-in URL**: `/onboarding`
4. **Session token configuration**:
   - Go to Sessions → Customize session token
   - **No changes needed** - The app uses database-based layout guards instead of JWT claims
5. **Verify API keys**:
   - Confirm the Publishable Key and Secret Key in Vercel match your Clerk Dashboard
   - For production, use `pk_live_...` and `sk_live_...` keys
   - For development/preview, use `pk_test_...` and `sk_test_...` keys

**IMPORTANT**: The onboarding flow auto-redirects completed users to their dashboard. Don't set redirects to `/dashboard` directly.

## Step 4: Database Setup

### 4.1 Create Production Database

Choose one of these options:

#### Option A: Neon (Recommended for Vercel)
1. Create account at https://neon.tech
2. Create new project
3. **IMPORTANT**: Get BOTH connection strings:
   - **Pooled connection** (with `-pooler`) → Use for `DATABASE_URL`
   - **Direct connection** (without `-pooler`) → Use for `DIRECT_URL`
4. Example:
   ```
   DATABASE_URL: postgresql://user:pass@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   DIRECT_URL:   postgresql://user:pass@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. **DO NOT** use `channel_binding=require` - it causes failures in Vercel's serverless environment

#### Option B: Supabase
1. Create account at https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
5. For Supabase, use the same connection string for both `DATABASE_URL` and `DIRECT_URL`

#### Option C: Other PostgreSQL Provider
- Ensure SSL is enabled
- Connection string format: `postgresql://user:pass@host:port/db?sslmode=require`

### 4.2 Run Database Migrations

After first deployment, run migrations in Vercel:

**Option 1: Using Vercel CLI**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Option 2: Using Supabase/Neon Console**
1. Connect to database via SQL editor
2. Run migrations from `prisma/migrations/` folder

**Option 3: Using Vercel Function**
Create a one-time migration script or use Vercel's database connection.

## Step 5: Configure Vercel Cron

### 5.1 Automatic Configuration (via vercel.json)

The `vercel.json` file is already configured with:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-expiries",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This schedules the cron job to run daily at 9 AM UTC.

### 5.2 Manual Configuration

If needed, configure in Vercel Dashboard:
1. Go to Project Settings → Cron Jobs
2. Add new cron job:
   - **Path**: `/api/cron/check-expiries`
   - **Schedule**: `0 9 * * *` (9 AM UTC daily)

### 5.3 Verify Cron Endpoint

The cron endpoint requires a secret header for security:

1. Add to environment variables:
   ```
   CRON_SECRET=your-random-secret-string
   ```

2. Update cron configuration to include header (if needed)

## Step 6: Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `supplyvault.com`)
3. Follow DNS configuration instructions

### 6.2 Configure DNS Records

Add the following DNS records:

**For Root Domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 6.3 SSL Certificate

SSL is automatically provisioned by Vercel once DNS is configured correctly.

## Step 7: Deploy

### 7.1 Initial Deployment

1. Click **"Deploy"** in Vercel dashboard
2. Monitor build logs
3. Wait for deployment to complete

### 7.2 Verify Deployment

1. Check deployment URL (e.g., `supplyvault.vercel.app`)
2. Review build logs for errors
3. Test homepage loads correctly

## Step 8: Post-Deployment Testing

### 8.1 Authentication Flow

1. ✅ Visit sign-up page
2. ✅ Create test account
3. ✅ Verify email confirmation (if enabled)
4. ✅ Sign in successfully
5. ✅ Verify redirect to dashboard

### 8.2 Core Functionality

1. ✅ **Brand Onboarding**
   - Complete brand profile setup
   - Verify brand is created in database

2. ✅ **Supplier Management**
   - Add a test supplier
   - Edit supplier details
   - Delete supplier (if needed)

3. ✅ **Certification Upload**
   - Upload a test certification document (PDF/image)
   - Verify S3 upload succeeds
   - Verify certification appears in list

4. ✅ **Alerts System**
   - Check alerts page loads
   - Verify alert creation
   - Test marking alerts as read

5. ✅ **PDF Export**
   - Click "Export Report" on supplier page
   - Verify PDF downloads correctly
   - Check PDF content is accurate

6. ✅ **Email Notifications**
   - Trigger test alert (modify expiry date if needed)
   - Verify email is received
   - Check email content and formatting

### 8.3 Performance Checks

1. ✅ Run Lighthouse audit (target: >90 performance score)
2. ✅ Check bundle size in build logs
3. ✅ Verify images load correctly
4. ✅ Test page load speeds

## Step 9: Production Checklist

### Database
- [ ] Production database created and configured
- [ ] Migrations run successfully
- [ ] Connection string added to Vercel env vars
- [ ] Database backups configured

### Authentication
- [ ] Clerk production keys configured
- [ ] Sign-up/Sign-in flow works
- [ ] User creation webhook tested
- [ ] User sessions persist correctly

### File Storage
- [ ] S3 bucket created and configured
- [ ] CORS configured for bucket
- [ ] Upload functionality tested
- [ ] Download URLs work correctly

### Email
- [ ] Resend API key configured
- [ ] Email domain verified (if using custom domain)
- [ ] Test email sent successfully
- [ ] Email templates render correctly

### Cron Jobs
- [ ] Cron job configured in Vercel
- [ ] Endpoint responds correctly
- [ ] Scheduled execution verified (check logs after 9 AM UTC)

### Security
- [ ] All API keys are production keys
- [ ] Environment variables secured
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured correctly

### Monitoring
- [ ] Vercel analytics enabled (optional)
- [ ] Error logging configured
- [ ] Performance monitoring set up

## Step 10: Go Live

1. ✅ All tests passed
2. ✅ Domain configured (if using custom domain)
3. ✅ SSL certificate active
4. ✅ Monitoring set up
5. ✅ Team notified of production URL

### Production URL

Your SupplyVault instance will be available at:
- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain** (if configured): `https://supplyvault.com`

## Troubleshooting

### Build Failures

**Error: Missing API key**
- Verify all environment variables are set in Vercel
- Check variable names match exactly (case-sensitive)

**Error: Database connection failed**
- Verify DATABASE_URL format
- Check database allows connections from Vercel IPs
- Ensure SSL is enabled

**Error: Prisma client not found**
- Add `prisma generate` to build command if needed
- Verify `@prisma/client` is in dependencies

### Runtime Errors

**Clerk authentication not working**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Check Clerk dashboard for correct keys
- Verify middleware is configured correctly

**S3 uploads failing**
- Verify AWS credentials are correct
- Check S3 bucket CORS configuration
- Verify bucket region matches AWS_REGION

**Emails not sending**
- Check Resend API key is valid
- Verify email domain is verified in Resend
- Check Vercel function logs for errors

### Cron Job Issues

**Cron not executing**
- Verify cron is configured in `vercel.json` or dashboard
- Check schedule format is correct (`0 9 * * *`)
- Review Vercel cron logs

**Cron endpoint errors**
- Check function logs in Vercel dashboard
- Verify endpoint doesn't require authentication
- Test endpoint manually via curl/Postman

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **Clerk Documentation**: https://clerk.com/docs
- **Supabase Documentation**: https://supabase.com/docs

## Maintenance

### Regular Tasks

- Monitor error logs weekly
- Review performance metrics
- Update dependencies monthly
- Backup database regularly
- Review and rotate API keys quarterly

### Updates

To deploy updates:
1. Push changes to main branch
2. Vercel automatically deploys
3. Verify deployment in preview
4. Promote to production (if using preview deployments)

---

**Deployment Date**: [Fill in after deployment]
**Production URL**: [Fill in after deployment]
**Deployed By**: [Your name]

