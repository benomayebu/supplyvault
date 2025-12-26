# Quick Deployment Guide

## 🚀 Deploy to Vercel in 5 Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js

### 3. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
RESEND_API_KEY=re_...
```

### 4. Deploy
Click "Deploy" - Vercel will build and deploy automatically!

### 5. Run Database Migrations
After first deployment:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for a step-by-step checklist.

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project Settings**: Project → Settings → Environment Variables
- **Deployment Logs**: Project → Deployments → [Latest] → Logs
- **Cron Jobs**: Project → Settings → Cron Jobs

## ⚠️ Important Notes

- Use production keys for all services (not test keys)
- Configure CORS for S3 bucket
- Verify email domain in Resend
- Test all major features after deployment

