# SupplyVault Development Roadmap
## Next Steps in Development

**Last Updated:** February 11, 2026  
**Current Status:** Phase 3 Complete - Network Effects Implemented

---

## 🎯 Executive Summary

SupplyVault has successfully completed the foundational phases:
- ✅ **Phase 1:** Multi-stakeholder marketplace with supplier and brand onboarding
- ✅ **Phase 2:** Supplier discovery with search and filtering
- ✅ **Phase 3:** Network effects with supplier connections
- ✅ **Infrastructure:** Database configuration, testing, and deployment setup

This roadmap outlines the next development phases to transform SupplyVault into a comprehensive AI-powered compliance management platform.

---

## 📊 Current State Assessment

### What's Complete ✅

#### Core Infrastructure
- Authentication with Clerk (multi-role support)
- PostgreSQL database with Prisma ORM
- Neon deployment configuration (pooled + direct connections)
- Comprehensive testing suite (58 tests, 100% pass rate)
- Production-ready deployment documentation

#### Supplier Features
- Profile management (onboarding, editing)
- Certification upload (manual entry)
- Dashboard with certification overview
- Profile completeness tracking

#### Brand Features
- Profile management
- Supplier discovery with search/filters
- Supplier detail views
- Supplier network management (add/remove suppliers)
- Connection tracking
- Dashboard with network overview

#### System Features
- Automated expiry alerts (90/30/7-day warnings)
- Team collaboration with role-based access
- Email notifications (cron-based)
- Multi-country support
- Compliance reporting (basic PDF export)

### What's Planned but Not Implemented ❌

Based on the original problem statement and documentation, these features were discussed but not yet built:

#### AI Features (High Priority)
1. **Certification Document Parsing** - Extract data from PDF certificates
2. **Auto-fill Cert Metadata** - Pre-populate forms from parsed documents
3. **Certification Validity Check** - Cross-reference against known standards
4. **Supplier Matching** - AI-powered supplier recommendations
5. **Compliance Gap Analysis** - Compare requirements vs. actual certifications
6. **Expiry Risk Scoring** - Predict compliance lapses
7. **Smart Alerts** - AI-generated summaries of attention items
8. **Email Cert Ingestion** - Parse certificates from email attachments
9. **Audit Report Generation** - AI-generated compliance reports
10. **Supply Chain Risk Mapping** - Multi-tier supplier risk analysis

#### Core Features (Medium Priority)
1. **Document Viewer** - View certification documents in-app
2. **Notification Center** - Centralized notification hub
3. **Supplier Request Flow** - Brands can request information from suppliers
4. **Analytics Dashboard** - Profile views, brand interest metrics
5. **Certification Verification Workflow** - Manual verification process
6. **Bulk Supplier Import** - CSV/Excel import for suppliers

---

## 🚀 Recommended Development Phases

### **Phase 4: Document Management & Viewer** (Weeks 1-2)
**Priority:** High  
**Complexity:** Low-Medium  
**Impact:** Immediate user value

#### Features to Build
1. **Document Upload Enhancement**
   - Add actual file upload to certification form (currently placeholder)
   - Store documents in AWS S3
   - Support PDF, JPG, PNG formats
   - File size validation (max 10MB)

2. **Document Viewer**
   - In-app PDF viewer for certifications
   - Download functionality
   - Thumbnail previews in certification lists
   - Secure document access (authenticated users only)

3. **Document Management**
   - Edit/replace documents
   - Document version history
   - Delete document functionality

#### Technical Requirements
- **Frontend:** React PDF viewer (`react-pdf` or `pdf.js`)
- **Backend:** AWS S3 integration (already in dependencies)
- **API Routes:**
  - `POST /api/certifications/upload` - Update to handle file uploads
  - `GET /api/certifications/[id]/document` - Serve documents securely
  - `DELETE /api/certifications/[id]/document` - Remove documents

#### Implementation Steps
1. Update certification upload form with file input
2. Implement S3 upload handler in API route
3. Store S3 URL in database
4. Build document viewer component
5. Add security middleware for document access
6. Update certification list to show document status

---

### **Phase 5: AI-Powered Certification Parsing** (Weeks 3-5)
**Priority:** High  
**Complexity:** Medium-High  
**Impact:** Major differentiation, reduces manual data entry

#### Features to Build
1. **PDF Certificate Parser**
   - Extract text from PDF uploads
   - Identify certificate type (GOTS, OEKO-TEX, etc.)
   - Extract key fields: issuer, dates, scope, certificate number
   - Return structured JSON data

2. **Auto-fill Form**
   - Pre-populate certification form with parsed data
   - Allow user to review/edit before saving
   - Highlight fields with low confidence
   - Manual override for all fields

3. **Validity Checker**
   - Cross-reference against known certification standards
   - Validate certificate numbers with issuing bodies (when possible)
   - Flag suspicious or invalid certificates
   - Provide confidence scores

#### Technical Stack
- **AI Service:** Anthropic Claude API (via Vercel AI SDK)
- **PDF Processing:** `pdf-parse` (Node.js)
- **Image Processing:** `sharp` (if images needed)
- **Libraries:**
  ```bash
  npm install @ai-sdk/anthropic pdf-parse ai
  ```

#### API Design
```typescript
// POST /api/certifications/parse
{
  "file": "base64_encoded_pdf",
  "filename": "certificate.pdf"
}

// Response
{
  "success": true,
  "data": {
    "certification_type": "GOTS",
    "certification_name": "Global Organic Textile Standard",
    "issuing_body": "Control Union",
    "issue_date": "2024-01-15",
    "expiry_date": "2025-01-14",
    "certificate_number": "CU12345",
    "scope": "Organic cotton processing",
    "confidence": 0.95
  },
  "warnings": ["expiry_date has low confidence (0.72)"]
}
```

#### Implementation Steps
1. Set up Anthropic Claude API credentials
2. Create PDF parser utility function
3. Build prompt engineering for certificate extraction
4. Create `/api/certifications/parse` endpoint
5. Update upload form to call parse API
6. Build auto-fill UI with review step
7. Add validation and confidence indicators
8. Implement fallback for failed parsing

#### Environment Variables Needed
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

---

### **Phase 6: Notification Center & Analytics** (Weeks 6-7)
**Priority:** Medium  
**Complexity:** Medium  
**Impact:** Improved user engagement

#### Features to Build
1. **Notification Center**
   - Centralized notification hub (bell icon in header)
   - Real-time notifications (new alerts, expiring certs)
   - Mark as read functionality
   - Filter by type (alerts, connections, system)
   - Notification preferences in settings

2. **Supplier Analytics**
   - Profile view tracking
   - Brand interest metrics
   - Certification health score
   - Compliance trend charts
   - Export analytics reports

3. **Brand Analytics**
   - Supplier network health
   - Certification coverage metrics
   - Compliance risk dashboard
   - Expiry timeline visualization
   - Custom date range filters

#### Technical Requirements
- **Real-time:** Server-Sent Events (SSE) or polling
- **Charts:** Recharts or Chart.js
- **Data Aggregation:** Prisma aggregations
- **Caching:** Redis (optional for performance)

#### Implementation Steps
1. Create notification system in database
2. Build notification API endpoints
3. Implement notification center UI
4. Add analytics data aggregation
5. Build dashboard charts and visualizations
6. Create export functionality

---

### **Phase 7: AI-Powered Supplier Matching** (Weeks 8-10)
**Priority:** Medium  
**Complexity:** High  
**Impact:** Major value-add for brands

#### Features to Build
1. **Requirement Profiler**
   - Brand specifies required certifications
   - Country/region preferences
   - Supplier type preferences
   - Minimum verification level
   - Save as supplier requirement profiles

2. **Smart Matching Algorithm**
   - AI-powered ranking based on requirements
   - Consider certification coverage
   - Factor in verification status
   - Geographic proximity
   - Historical connection success

3. **Match Explanation**
   - Why each supplier matches
   - Coverage percentage
   - Missing certifications highlighted
   - Recommendation confidence score

4. **Automated Suggestions**
   - Daily/weekly email with top matches
   - "Suppliers you might like" section
   - Trending suppliers in network

#### AI Approach
```typescript
// Use Claude to analyze and rank suppliers
const prompt = `
Given a brand's requirements:
- Required certifications: ${requirements.certifications}
- Preferred countries: ${requirements.countries}
- Supplier type: ${requirements.type}

And these suppliers:
${JSON.stringify(suppliers)}

Rank the suppliers by fit and explain why.
`;
```

#### Implementation Steps
1. Create requirement profile model
2. Build requirement profile UI
3. Implement matching algorithm
4. Create match scoring system
5. Build AI-powered ranking
6. Design match results page
7. Add email notification system

---

### **Phase 8: Compliance Gap Analysis** (Weeks 11-12)
**Priority:** Medium  
**Complexity:** Medium  
**Impact:** High value for brands

#### Features to Build
1. **Gap Analysis Dashboard**
   - Compare brand requirements vs. supplier certifications
   - Visual gap identification
   - Missing certifications highlighted
   - Expiring certifications flagged
   - Priority recommendations

2. **Risk Scoring**
   - Calculate compliance risk per supplier
   - Aggregate network risk score
   - Risk trend over time
   - Predictive expiry risk

3. **Action Items**
   - Automatically generated to-do list
   - Prioritized by risk level
   - Assign to team members
   - Track completion status

4. **Compliance Reports**
   - Executive summary reports
   - Detailed gap analysis
   - Trend analysis
   - Export to PDF/Excel

#### Implementation Steps
1. Build gap analysis logic
2. Create risk scoring algorithm
3. Design dashboard visualizations
4. Implement action item system
5. Build report generation
6. Add email summaries

---

### **Phase 9: Email Certificate Ingestion** (Weeks 13-15)
**Priority:** Low-Medium  
**Complexity:** High  
**Impact:** Automation, time-saving

#### Features to Build
1. **Gmail Integration**
   - OAuth connection to Gmail
   - Scan incoming emails for attachments
   - Detect PDF certificates
   - Parse and extract data
   - Create draft certifications for review

2. **Email Rules**
   - Define trusted sender emails
   - Auto-approve from verified senders
   - Keyword-based filtering
   - Attachment type filters

3. **Review Queue**
   - List of detected certificates
   - Review and approve/reject
   - Edit parsed data
   - Bulk approve functionality

#### Technical Requirements
- **OAuth:** Gmail API with OAuth 2.0 (already has GmailAccount model)
- **Email Parsing:** `mailparser` library
- **Scheduling:** Cron jobs (already configured)

#### Implementation Steps
1. Complete Gmail OAuth implementation
2. Build email polling worker
3. Implement attachment detection
4. Parse certificates from emails
5. Create review queue UI
6. Add auto-approval rules

---

### **Phase 10: Advanced Features** (Weeks 16+)
**Priority:** Low  
**Complexity:** High  
**Impact:** Enterprise-grade platform

#### Features to Build
1. **Multi-tier Supply Chain**
   - Track suppliers of suppliers
   - Cascade compliance requirements
   - Supply chain visualization
   - Risk propagation analysis

2. **Audit Trail**
   - Complete activity logging
   - Change history for all records
   - Compliance audit reports
   - Exportable audit logs

3. **Custom Certification Types**
   - Brands can define custom certifications
   - Template management
   - Custom validation rules

4. **API Access**
   - RESTful API for third-party integrations
   - API key management
   - Rate limiting
   - API documentation

5. **Mobile App**
   - React Native app for iOS/Android
   - Offline support
   - Push notifications
   - Document scanning

---

## 📋 Implementation Priorities

### Immediate Next Steps (Weeks 1-2)
**Focus:** Document Management & Viewer (Phase 4)

**Why Start Here:**
- Completes certification upload flow
- Provides immediate user value
- Low complexity, high impact
- Foundation for AI parsing (Phase 5)

**Action Items:**
1. Set up S3 bucket configuration
2. Update certification upload API
3. Build document viewer component
4. Test end-to-end flow

### High Priority (Weeks 3-7)
1. **AI Certification Parsing (Phase 5)** - Major differentiation
2. **Notification Center (Phase 6)** - User engagement

### Medium Priority (Weeks 8-12)
1. **Supplier Matching (Phase 7)** - Value-add for brands
2. **Compliance Gap Analysis (Phase 8)** - Risk management

### Long-term (Weeks 13+)
1. **Email Ingestion (Phase 9)** - Automation
2. **Advanced Features (Phase 10)** - Enterprise features

---

## 🛠️ Technical Debt & Infrastructure

### Quick Wins
1. **Add Loading States** - Better UX during async operations
2. **Error Boundaries** - Graceful error handling
3. **Caching Strategy** - Redis for frequently accessed data
4. **Database Indexes** - Optimize common queries
5. **Image Optimization** - Next.js Image component

### Performance Optimizations
1. **Server Components** - Use RSC where possible
2. **Pagination** - Implement cursor-based pagination
3. **Database Connection Pooling** - Already configured with Neon
4. **CDN for Static Assets** - Vercel automatically handles this
5. **API Response Caching** - Cache supplier searches

### Security Enhancements
1. **Rate Limiting** - Prevent API abuse
2. **Input Validation** - Zod schemas for all inputs
3. **SQL Injection Protection** - Prisma handles this
4. **XSS Prevention** - React handles this
5. **CSRF Protection** - Add CSRF tokens to forms

### Monitoring & Observability
1. **Error Tracking** - Sentry integration
2. **Performance Monitoring** - Vercel Analytics
3. **Database Monitoring** - Neon dashboard
4. **User Analytics** - PostHog or Mixpanel
5. **Uptime Monitoring** - Vercel or third-party

---

## 💰 Resource Requirements

### Phase 4: Document Management
- **Time:** 1-2 weeks (1 developer)
- **Services:** AWS S3 ($5-20/month based on usage)
- **Complexity:** Low-Medium

### Phase 5: AI Parsing
- **Time:** 2-3 weeks (1 developer)
- **Services:** 
  - Anthropic Claude API ($10-100/month based on usage)
  - AWS S3 (already needed)
- **Complexity:** Medium-High

### Phase 6: Notifications & Analytics
- **Time:** 1-2 weeks (1 developer)
- **Services:** None (optional Redis: $10-30/month)
- **Complexity:** Medium

### Phase 7-10
- **Time:** 8-12 weeks total
- **Services:** Additional API costs for AI features
- **Complexity:** High

---

## 📈 Success Metrics

### Phase 4 Metrics
- **Adoption:** % of certifications with documents uploaded
- **Engagement:** Document views per user
- **Quality:** Upload success rate

### Phase 5 Metrics
- **Accuracy:** Parsing accuracy rate (target: >90%)
- **Time Saved:** Reduction in manual data entry time
- **Adoption:** % of users using AI parsing
- **User Satisfaction:** NPS score improvement

### Phase 6 Metrics
- **Engagement:** Notification open rate
- **Retention:** User return frequency
- **Analytics Usage:** % of users viewing analytics

### Phase 7+ Metrics
- **Match Quality:** Connection rate from AI suggestions
- **User Value:** Time saved per user per week
- **Business Impact:** Compliance risk reduction

---

## 🎯 Recommended Approach

### Week 1-2: Document Management (Phase 4)
**Goal:** Complete certification upload flow with actual file uploads

**Deliverables:**
- Working file upload to S3
- Document viewer component
- Updated certification forms
- Secure document access

### Week 3-5: AI Parsing (Phase 5)
**Goal:** AI-powered certificate data extraction

**Deliverables:**
- PDF parsing API
- Claude integration
- Auto-fill UI
- Validation workflow

### Week 6-7: Notifications (Phase 6)
**Goal:** Centralized notification system

**Deliverables:**
- Notification center
- Real-time alerts
- Basic analytics dashboard

### Week 8+: AI Matching & Beyond
**Goal:** Advanced AI features and enterprise capabilities

**Deliverables:**
- Supplier matching
- Gap analysis
- Email ingestion
- Additional enterprise features

---

## 🚦 Decision Points

### Should We Build AI Features First?
**Pros:**
- Major differentiation
- High user value
- Competitive advantage

**Cons:**
- Higher complexity
- External API dependencies
- Cost considerations

**Recommendation:** Yes, but start with Phase 4 (Document Management) first to establish the foundation, then move to Phase 5 (AI Parsing) which provides the highest impact.

### TypeScript vs. Python for AI?
**Recommendation:** Stick with TypeScript + Vercel AI SDK
- Single language across stack
- Vercel AI SDK is production-ready
- Easy deployment (no separate services)
- Good enough for most AI tasks
- Only consider Python for heavy ML model training (not needed now)

### Build vs. Buy for AI?
**Recommendation:** Use Claude API (Anthropic)
- Focus on core business logic
- Faster time to market
- Lower maintenance burden
- High quality results
- Can always switch to custom models later

---

## 📚 Resources & Documentation

### For Phase 4 (Document Management)
- [AWS S3 SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)
- [React PDF Viewer](https://github.com/wojtekmaj/react-pdf)
- [Next.js File Uploads](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body)

### For Phase 5 (AI Parsing)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [pdf-parse NPM](https://www.npmjs.com/package/pdf-parse)

### For Phase 6+ (Advanced Features)
- [Recharts Documentation](https://recharts.org/)
- [Gmail API](https://developers.google.com/gmail/api/guides)
- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

## 🎬 Getting Started

### To Begin Phase 4 (Document Management):

1. **Set up S3 bucket:**
   ```bash
   # In AWS Console, create bucket: supplyvault-certificates
   # Enable versioning and encryption
   # Set up IAM user with S3 access
   ```

2. **Add environment variables:**
   ```bash
   # .env.local
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=supplyvault-certificates
   NEXT_PUBLIC_AWS_S3_BUCKET_URL=https://supplyvault-certificates.s3.amazonaws.com
   ```

3. **Install S3 utilities:**
   ```bash
   # Already installed: @aws-sdk/client-s3
   npm install @aws-sdk/s3-request-presigner
   ```

4. **Start coding:**
   - Update `/app/api/certifications/upload/route.ts`
   - Add `/lib/s3.ts` utility functions
   - Update certification upload form
   - Build document viewer component

### To Begin Phase 5 (AI Parsing):

1. **Get Anthropic API key:**
   - Sign up at https://console.anthropic.com
   - Create API key
   - Add to environment variables

2. **Install AI dependencies:**
   ```bash
   npm install @ai-sdk/anthropic ai pdf-parse
   ```

3. **Start coding:**
   - Create `/lib/ai/certificate-parser.ts`
   - Add `/api/certifications/parse` route
   - Build parsing logic and prompts
   - Update upload form with parse step

---

## 📞 Support & Questions

For questions about implementation:
1. Review the detailed phase documentation above
2. Check existing code in similar features
3. Refer to linked documentation
4. Use test-driven development approach

---

**Next Recommended Action:** Start with Phase 4 (Document Management & Viewer) to complete the certification upload flow, then move to Phase 5 (AI Parsing) for major differentiation.
