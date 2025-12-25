# Environment Variables Setup

Create a `.env.local` file in the root directory with the following placeholders:

```env
# Database
DATABASE_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# AWS S3
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

# Resend Email API
RESEND_API_KEY=
```

## Clerk Setup Instructions

1. **Get your Clerk keys:**
   - Go to https://dashboard.clerk.com
   - Navigate to your application
   - Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` from the API Keys section
   - Copy `CLERK_SECRET_KEY` from the API Keys section

2. **Set up webhook:**
   - In Clerk dashboard, go to Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.deleted`
   - Copy the signing secret to `CLERK_WEBHOOK_SECRET`

**Note:** `.env.local` is gitignored by default. Fill in these values with your actual credentials for development and production.

