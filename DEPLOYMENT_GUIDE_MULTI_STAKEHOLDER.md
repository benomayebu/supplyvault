# Multi-Stakeholder Marketplace Deployment Guide

## Prerequisites

Before deploying this update:
- [ ] Database backup completed
- [ ] Clerk project configured
- [ ] Testing environment validated
- [ ] Stakeholders notified of new features

## Deployment Steps

### 1. Database Migration

The schema changes are backward compatible but require migration:

```bash
# Ensure database connection is configured
export DATABASE_URL="your_database_url"
export DIRECT_URL="your_direct_database_url"

# Run migration
npx prisma migrate deploy

# Verify migration
npx prisma db pull
```

**Schema Changes:**
- Added `StakeholderRole` enum (SUPPLIER, BRAND)
- Brand table: Added `address`, `annual_volume`, `required_certifications`
- Supplier table: Added `clerk_user_id` (optional), `manufacturing_capabilities`
- Supplier table: Made `brand_id` and `supplier_type` optional

### 2. Existing User Handling

**Option A: Automatic Role Assignment (Recommended)**

Run this script to assign roles to existing users:

```sql
-- All existing users are brands (since they have brand records)
-- Update Clerk metadata programmatically using Clerk API
-- See scripts/assign-existing-roles.ts
```

Create `scripts/assign-existing-roles.ts`:
```typescript
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../lib/db";

async function assignExistingRoles() {
  const brands = await prisma.brand.findMany({
    select: { clerk_user_id: true }
  });

  for (const brand of brands) {
    try {
      await clerkClient.users.updateUserMetadata(brand.clerk_user_id, {
        unsafeMetadata: {
          stakeholderRole: "BRAND"
        }
      });
      console.log(`✓ Assigned BRAND role to ${brand.clerk_user_id}`);
    } catch (error) {
      console.error(`✗ Failed for ${brand.clerk_user_id}:`, error);
    }
  }
}

assignExistingRoles();
```

**Option B: Redirect to Onboarding**

If you prefer existing users to select their role:
- Don't run the script above
- Existing users will be redirected to /onboarding
- They'll select "Brand" and their existing record will be linked

### 3. Environment Variables

No new environment variables required. Verify existing ones:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Update redirect URLs (optional)
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### 4. Build and Deploy

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Deploy to Vercel (or your platform)
vercel --prod
```

### 5. Post-Deployment Verification

**Test New User Flow:**
1. Sign up as new user
2. Verify role selection page appears
3. Select "Supplier" → Complete supplier profile → Check dashboard
4. Sign up another user
5. Select "Brand" → Complete brand profile → Check dashboard

**Test Existing User Flow:**
1. Sign in as existing brand user
2. Verify redirect to appropriate dashboard
3. Check that existing suppliers are visible
4. Verify certifications still accessible

**Test Route Protection:**
1. As supplier, try accessing /brand/* → Should redirect
2. As brand, try accessing /supplier/* → Should redirect
3. Access /dashboard → Should redirect to role-specific dashboard

**Test API Endpoints:**
```bash
# Test supplier creation (authenticated request)
curl -X POST https://your-domain.com/api/suppliers/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "name": "Test Supplier",
    "country": "Bangladesh",
    "supplier_type": "FABRIC_MILL"
  }'

# Test brand creation (authenticated request)
curl -X POST https://your-domain.com/api/brands/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "company_name": "Test Brand",
    "country": "United States"
  }'
```

## Rollback Plan

If issues occur, rollback steps:

### 1. Revert Code
```bash
git revert <commit-hash>
vercel --prod
```

### 2. Database Rollback (if needed)
```sql
-- Remove new columns (data will be lost!)
ALTER TABLE "brands" DROP COLUMN "address";
ALTER TABLE "brands" DROP COLUMN "annual_volume";
ALTER TABLE "brands" DROP COLUMN "required_certifications";

ALTER TABLE "suppliers" DROP COLUMN "clerk_user_id";
ALTER TABLE "suppliers" DROP COLUMN "manufacturing_capabilities";
ALTER TABLE "suppliers" ALTER COLUMN "brand_id" SET NOT NULL;
ALTER TABLE "suppliers" ALTER COLUMN "supplier_type" SET NOT NULL;

-- Drop enum
DROP TYPE "StakeholderRole";
```

### 3. Clean Clerk Metadata
```typescript
// Remove stakeholderRole from all users
const users = await clerkClient.users.getUserList();
for (const user of users) {
  await clerkClient.users.updateUserMetadata(user.id, {
    unsafeMetadata: {}
  });
}
```

## Monitoring

After deployment, monitor:

1. **User Behavior:**
   - Role selection distribution (Supplier vs Brand)
   - Onboarding completion rate
   - Time spent on each onboarding step

2. **Error Rates:**
   - API endpoint failures
   - Redirect loops
   - Authentication issues

3. **Database:**
   - New supplier creation rate
   - New brand creation rate
   - Migration status

4. **Performance:**
   - Middleware execution time
   - Dashboard load times
   - API response times

## Support

### Common Issues

**Q: User stuck in onboarding loop**
A: Check Clerk metadata. Ensure `stakeholderRole` is set to either "SUPPLIER" or "BRAND"

**Q: Existing user can't access dashboard**
A: Check if metadata is set. May need to run role assignment script or have user go through onboarding.

**Q: Supplier can access brand routes**
A: Check middleware logs. Ensure `stakeholderRole` is correctly set in Clerk metadata.

**Q: Database migration fails**
A: Check for:
- Foreign key constraints
- Existing null values in columns that shouldn't be null
- Database connection issues

## Success Criteria

Deployment is successful when:
- ✅ All existing users can access their dashboards
- ✅ New users can complete onboarding
- ✅ Supplier dashboard loads correctly
- ✅ Brand dashboard loads correctly
- ✅ Route protection works (no unauthorized access)
- ✅ No error spikes in logs
- ✅ Database migration completed successfully

## Timeline

Recommended deployment schedule:

1. **Day 1 (Testing):** Deploy to staging, run all tests
2. **Day 2 (Migration):** Run database migration on production during low traffic
3. **Day 3 (Code Deploy):** Deploy application code
4. **Day 4 (User Assignment):** Run role assignment script for existing users
5. **Day 5 (Monitoring):** Monitor metrics and user feedback
6. **Day 6-7 (Support):** Provide extra support for any issues

## Next Steps After Deployment

Once deployment is stable:

1. **Phase 2:** Implement supplier discovery/search
2. **Phase 3:** Add network effects and invitations
3. **Phase 4:** Build verification system
4. **Phase 5:** Odoo integration
5. **Phase 6:** Monetization features

## Contact

For deployment support:
- Technical issues: Check MULTI_STAKEHOLDER_IMPLEMENTATION.md
- Database questions: Review migration files
- Clerk integration: See Clerk documentation
