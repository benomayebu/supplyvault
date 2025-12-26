# SupplyVault Deployment Checklist

Use this checklist to ensure a successful deployment to Vercel.

## Pre-Deployment ✅

- [ ] Code is pushed to GitHub repository
- [ ] `npm run type-check` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully locally
- [ ] All tests pass (if applicable)

## Vercel Setup ✅

- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Project imported from GitHub
- [ ] Framework preset: Next.js
- [ ] Root directory configured correctly

## Environment Variables ✅

- [ ] `DATABASE_URL` - Production PostgreSQL connection string
- [ ] `CLERK_SECRET_KEY` - Production Clerk secret key
- [ ] `CLERK_PUBLISHABLE_KEY` - Production Clerk publishable key
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Production Clerk publishable key (public)
- [ ] `AWS_S3_BUCKET` - S3 bucket name
- [ ] `AWS_ACCESS_KEY_ID` - AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS secret key
- [ ] `AWS_REGION` - AWS region (e.g., us-east-1)
- [ ] `RESEND_API_KEY` - Resend API key for emails
- [ ] All variables added to Production environment
- [ ] Preview/Development environments configured (if needed)

## Database ✅

- [ ] Production PostgreSQL database created
- [ ] Database connection string obtained
- [ ] SSL enabled on database
- [ ] Database migrations ready
- [ ] Migration plan documented

## Third-Party Services ✅

### Clerk
- [ ] Production application created in Clerk
- [ ] Production keys copied
- [ ] Webhook endpoint configured: `https://your-domain.com/api/webhooks/clerk`
- [ ] Webhook signing secret added (if needed)
- [ ] Allowed redirect URLs configured

### AWS S3
- [ ] S3 bucket created
- [ ] CORS policy configured:
  ```json
  [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["https://your-domain.com"],
      "ExposeHeaders": []
    }
  ]
  ```
- [ ] Bucket policy configured for public read (if needed)
- [ ] IAM user created with S3 permissions
- [ ] Access keys generated

### Resend
- [ ] Resend account created
- [ ] API key generated
- [ ] Email domain verified (if using custom domain)
- [ ] "From" email address configured

## Vercel Configuration ✅

- [ ] `vercel.json` committed to repository
- [ ] Cron job configured (daily at 9 AM UTC)
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next` (default)
- [ ] Node.js version specified (if needed)

## Domain Configuration (Optional) ✅

- [ ] Custom domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate provisioned
- [ ] Domain verified and active

## Initial Deployment ✅

- [ ] Clicked "Deploy" in Vercel
- [ ] Build completed successfully
- [ ] No build errors or warnings
- [ ] Deployment URL accessible

## Database Migration ✅

- [ ] Connected to production database
- [ ] Ran `npx prisma migrate deploy`
- [ ] All migrations applied successfully
- [ ] Database schema verified

## Testing ✅

### Authentication
- [ ] Sign-up page loads
- [ ] Can create new account
- [ ] Email verification works (if enabled)
- [ ] Sign-in works
- [ ] Redirect to dashboard works
- [ ] Sign-out works

### Brand Onboarding
- [ ] Onboarding page loads
- [ ] Can complete brand profile
- [ ] Brand saved to database

### Suppliers
- [ ] Suppliers list page loads
- [ ] Can add new supplier
- [ ] Can edit supplier
- [ ] Can delete supplier
- [ ] Filters work correctly
- [ ] Search works correctly

### Certifications
- [ ] Can upload certification
- [ ] File uploads to S3 successfully
- [ ] Certification appears in list
- [ ] Can view certification details
- [ ] Document viewer loads correctly
- [ ] Can download document
- [ ] Can delete certification

### Alerts
- [ ] Alerts page loads
- [ ] Alerts display correctly
- [ ] Can mark alert as read
- [ ] Can delete alert
- [ ] Filters work correctly

### Reports
- [ ] Can export supplier compliance report
- [ ] PDF generates correctly
- [ ] PDF downloads successfully
- [ ] PDF content is accurate

### Email Notifications
- [ ] Test alert triggered
- [ ] Email received
- [ ] Email content correct
- [ ] Links in email work

### Cron Job
- [ ] Cron endpoint accessible
- [ ] Cron job executes (check logs after 9 AM UTC)
- [ ] Alerts created correctly
- [ ] Emails sent correctly

## Performance ✅

- [ ] Lighthouse score > 90 (Performance)
- [ ] Page load times acceptable
- [ ] Images optimized and loading
- [ ] No console errors
- [ ] No network errors

## Security ✅

- [ ] All API keys are production keys
- [ ] Environment variables not exposed
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Authentication required for protected routes

## Monitoring ✅

- [ ] Vercel analytics enabled (optional)
- [ ] Error logging reviewed
- [ ] Performance metrics baseline established
- [ ] Alerts configured (optional)

## Documentation ✅

- [ ] Production URL documented
- [ ] Access instructions shared with team
- [ ] Deployment process documented
- [ ] Troubleshooting guide available

## Post-Deployment ✅

- [ ] Team notified of deployment
- [ ] Production URL shared
- [ ] Initial user testing completed
- [ ] Feedback collected
- [ ] Issues logged and prioritized

---

## Quick Reference

### Production URL
```
https://your-project.vercel.app
```

### Important Commands
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Support Contacts
- Vercel Support: https://vercel.com/support
- Clerk Support: https://clerk.com/support
- Database Support: [Your provider's support]

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Production URL**: _______________
**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Completed

