# Multi-Stakeholder Marketplace Implementation

## Overview

This implementation transforms SupplyVault from a single-stakeholder (brand-only) application into a multi-stakeholder marketplace supporting both **Suppliers** and **Brands** as independent users.

## Architecture Decision: Option B (Multi-Stakeholder Marketplace)

Based on market research and strategic positioning:
- **Suppliers**: Free accounts, upload their own certifications
- **Brands**: Paying customers, discover and track verified suppliers
- **Model**: Two-sided marketplace (similar to Stripe Connect)

## Implementation Summary

### Phase 1: MVP Architecture (Completed)

#### 1. Database Schema Updates

**New Enum:**
```prisma
enum StakeholderRole {
  SUPPLIER
  BRAND
}
```

**Updated Supplier Model:**
- Added `clerk_user_id` (optional, unique) for independent authentication
- Made `brand_id` optional for backward compatibility
- Made `supplier_type` nullable
- Added `manufacturing_capabilities` field

**Updated Brand Model:**
- Added `address`, `annual_volume`, `required_certifications` fields

#### 2. Onboarding Flow

**Three-Step Process:**

1. **Role Selection** (`/onboarding`)
   - User selects: "I am a Supplier" or "I am a Brand"
   - Role stored in Clerk metadata: `unsafeMetadata.stakeholderRole`

2. **Supplier Profile Setup** (`/onboarding/supplier`)
   - Company name, country, address
   - Supplier type (Fabric Mill, Dye House, etc.)
   - Manufacturing capabilities (checkboxes)
   - Creates Supplier record with `clerk_user_id`

3. **Brand Profile Setup** (`/onboarding/brand`)
   - Company name, country, address
   - Annual purchasing volume
   - Required certifications (what they look for)
   - Creates Brand record with `clerk_user_id`
   - Creates User record for team management

#### 3. Middleware Protection

**Route-Based Access Control:**

```typescript
// Supplier routes: /supplier/*
- Only accessible to users with stakeholderRole = "SUPPLIER"
- Redirects brands to /brand/dashboard

// Brand routes: /brand/*
- Only accessible to users with stakeholderRole = "BRAND"
- Redirects suppliers to /supplier/dashboard

// Legacy route: /dashboard
- Redirects to role-specific dashboard based on stakeholderRole
```

**Implementation:**
- Checks `sessionClaims.unsafeMetadata.stakeholderRole` on every request
- Enforces access control before page loads
- Handles users without role (redirects to `/onboarding`)

#### 4. API Endpoints

**Supplier Creation:**
```
POST /api/suppliers/create
Body: { name, country, address?, supplier_type?, manufacturing_capabilities? }
Creates: Supplier record with clerk_user_id
```

**Brand Creation:**
```
POST /api/brands/create
Body: { company_name, country, address?, annual_volume?, required_certifications? }
Creates: 
  - Brand record with clerk_user_id
  - User record (ADMIN role) for team management
```

#### 5. Dashboards

**Supplier Dashboard** (`/supplier/dashboard`)
- Profile summary
- Certification count
- Quick actions (upload cert, edit profile)
- Recent certifications list

**Brand Dashboard** (`/brand/dashboard`)
- Supplier count
- Total certifications across suppliers
- Quick actions (find suppliers, add supplier)
- Suppliers list with cert counts

#### 6. Authentication Utilities

**New Functions:**
```typescript
// Get stakeholder role from Clerk metadata
getStakeholderRole(): Promise<"SUPPLIER" | "BRAND" | null>

// Get current supplier profile
getCurrentSupplier(): Promise<Supplier | null>

// Existing functions updated for compatibility
getCurrentBrand()
getCurrentUserRecord()
```

## User Flows

### Supplier Journey
```
1. Sign up via Clerk
2. Redirect to /onboarding
3. Select "Supplier" role → metadata updated
4. Complete supplier profile form
5. API creates Supplier record
6. Redirect to /supplier/dashboard
7. Upload certifications, manage profile
```

### Brand Journey
```
1. Sign up via Clerk
2. Redirect to /onboarding
3. Select "Brand" role → metadata updated
4. Complete brand profile form
5. API creates Brand + User records
6. Redirect to /brand/dashboard
7. Discover suppliers, track compliance
```

## Technical Details

### Clerk Metadata Storage
```typescript
user.unsafeMetadata = {
  stakeholderRole: "SUPPLIER" | "BRAND"
}
```

### Middleware Logic Flow
```
1. Check if route is public → allow
2. Check if user authenticated → protect
3. Get stakeholderRole from sessionClaims
4. If accessing /supplier/* and role !== "SUPPLIER" → redirect
5. If accessing /brand/* and role !== "BRAND" → redirect
6. If accessing /dashboard → redirect to /{role}/dashboard
7. If no role and not on /onboarding → redirect to /onboarding
```

### Database Relationships

**Supplier (Independent)**
```
clerk_user_id → Unique identifier
brand_id → Optional (for suppliers added by brands)
```

**Brand (Independent)**
```
clerk_user_id → Unique identifier
users[] → Team members (User model)
suppliers[] → Suppliers added by this brand
```

## Backward Compatibility

The implementation maintains backward compatibility:
- Existing Brand records continue to work
- Existing Supplier records (brand-owned) still function
- `brand_id` on Supplier is optional, not required
- `supplier_type` is nullable to handle existing data

## Key Files Changed

### Schema & Database
- `prisma/schema.prisma` - Added StakeholderRole enum, updated models

### Onboarding
- `app/onboarding/page.tsx` - Role selection
- `app/onboarding/supplier/page.tsx` - Supplier profile setup
- `app/onboarding/brand/page.tsx` - Brand profile setup

### Dashboards
- `app/supplier/dashboard/page.tsx` - Supplier dashboard
- `app/brand/dashboard/page.tsx` - Brand dashboard

### API
- `app/api/suppliers/create/route.ts` - Create supplier profile
- `app/api/brands/create/route.ts` - Create brand profile

### Auth & Middleware
- `middleware.ts` - Role-based routing protection
- `lib/auth.ts` - Helper functions for auth/role management
- `app/sign-up/[[...sign-up]]/page.tsx` - Updated redirect

### Type Fixes
- `lib/suppliers.ts` - Updated types for nullable supplier_type
- `lib/reports.ts` - Handle nullable fields
- `components/suppliers/supplier-row.tsx` - Handle nullable supplier_type
- `app/dashboard/suppliers/[id]/page.tsx` - Handle nullable supplier_type

## Next Steps (Future Phases)

### Phase 2: Supplier Discovery
- Search functionality for brands to find suppliers
- Filter by country, certifications, capabilities
- Supplier verification system
- Public supplier profiles

### Phase 3: Network Effects
- Supplier invitation system
- Brand discovery for suppliers
- Connection requests
- Messaging system

### Phase 4: Verification & Compliance
- Automated certificate verification
- Document authenticity checks
- Compliance scoring
- Audit trail for EU DPP

### Phase 5: Integrations
- Odoo ERP integration
- API for third-party access
- Webhook notifications
- Export capabilities

### Phase 6: Monetization
- Subscription tiers for brands
- Premium features (analytics, reports)
- API access plans
- White-label options

## Testing Checklist

- [ ] New user can sign up and select supplier role
- [ ] Supplier profile creation works
- [ ] Supplier redirected to /supplier/dashboard after setup
- [ ] Supplier cannot access /brand/* routes
- [ ] New user can sign up and select brand role
- [ ] Brand profile creation works
- [ ] Brand redirected to /brand/dashboard after setup
- [ ] Brand cannot access /supplier/* routes
- [ ] Existing brands still work (backward compatibility)
- [ ] /dashboard redirects based on role
- [ ] Middleware enforces route protection
- [ ] Role persists across sessions (Clerk metadata)

## Migration Notes

**For Production Deployment:**

1. **Database Migration:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Existing Users:**
   - Existing Brand users: Will be redirected to /onboarding
   - They should select "Brand" role
   - Their existing Brand record will be linked automatically
   - Or: Pre-populate metadata for existing users

3. **Environment Variables:**
   - No new env vars required
   - Uses existing Clerk configuration

4. **Monitoring:**
   - Watch for users stuck in onboarding
   - Monitor role selection distribution
   - Track conversion rates by role

## Security Considerations

1. **Role Immutability:**
   - Once set, stakeholderRole should not change
   - Implement role change request flow if needed

2. **Data Access:**
   - Suppliers can only access their own data
   - Brands can only access their suppliers' data
   - Cross-stakeholder data access prohibited

3. **API Security:**
   - All endpoints check authentication
   - Role-specific endpoints verify stakeholder type
   - Input validation on all forms

## Performance Notes

- Middleware runs on every request (minimal overhead)
- Role check is fast (reads from session claims)
- No additional database queries for route protection
- Dashboards query only user's own data

## Conclusion

This implementation successfully transforms SupplyVault into a multi-stakeholder marketplace while maintaining backward compatibility and following best practices for security and user experience.
