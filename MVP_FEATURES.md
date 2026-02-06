# MVP Features Implementation Guide

This document describes the implementation of the MVP (Minimum Viable Product) features for SupplyVault's automated certificate management system.

## Overview

The MVP consists of 6 phases designed to automate the certificate ingestion, validation, verification, and monitoring workflow:

1. **Phase 1**: Core Certificate Ingestion & Dashboard
2. **Phase 2**: OCR, Data Extraction & Validation
3. **Phase 3**: Automated Verification Engine
4. **Phase 4**: Expiry Monitoring & Alerts *(Already Complete)*
5. **Phase 5**: Re-Verification & Manual Review
6. **Phase 6**: Advanced Dashboard & Reporting *(Future Work)*

## Implemented Features

### Phase 1: Gmail OAuth & Email Ingestion ✅

#### Gmail OAuth Integration
- **Endpoints**:
  - `GET /api/auth/gmail` - Initiate OAuth flow
  - `GET /api/auth/gmail/callback` - Handle OAuth callback
- **Database**: Stores `gmail_refresh_token`, `gmail_token_expiry`, `gmail_connected_at` in Brand table
- **Scopes**: Read and modify Gmail (to fetch emails with attachments)

#### Email Import API
- **Endpoint**: `POST /api/email-import`
- **Features**:
  - Fetches emails with PDF/image attachments from Gmail
  - Creates EmailImport records for tracking
  - Downloads attachments and uploads to S3
  - Auto-creates suppliers based on sender email
  - Links certifications to email imports

#### Hash-based Deduplication
- Uses SHA-256 hash of file content
- Prevents duplicate certificate imports
- Stored in `document_hash` field

### Phase 2: OCR & Data Extraction ✅

#### Text Extraction
- **Library**: `pdf-parse` for PDFs, `tesseract.js` for images
- **File**: `/lib/extraction.ts`
- **Supported formats**: PDF, JPG, JPEG, PNG

#### NLP Data Extraction
- **Patterns extracted**:
  - Certificate number (multiple regex patterns)
  - Certification type (GOTS, OEKO-TEX, SA8000, BSCI, ISO14001)
  - Issuing body
  - Issue date and expiry date (multiple date formats)
  - Company/facility name
- **Confidence scoring**: 0-1 score based on number of fields extracted
- **Threshold**: Certificates with <70% confidence flagged for manual review

### Phase 3: Automated Verification Engine ✅

#### Verification Router
- **File**: `/lib/verification/index.ts`
- **Pattern**: Strategy pattern for pluggable verifiers
- **Fallback**: Routes to manual review if no verifier available

#### SA8000 Verifier (List Matching)
- **File**: `/lib/verification/sa8000-verifier.ts`
- **Method**: Matches certificate number against database of certified facilities
- **Algorithm**: Levenshtein distance for company name matching
- **Confidence**: High (0.9-1.0) for exact matches

#### GOTS Verifier (Placeholder)
- **File**: `/lib/verification/gots-verifier.ts`
- **Status**: Placeholder for future API/web scraping integration
- **Database**: https://www.global-standard.org/public-database

#### OEKO-TEX Verifier (Placeholder)
- **File**: `/lib/verification/oekotex-verifier.ts`
- **Status**: Placeholder for future web scraping integration
- **Check URL**: https://www.oeko-tex.com/en/label-check

#### Verification API
- **Endpoint**: `POST /api/certifications/verify`
- **Purpose**: Manually trigger verification for specific certificate
- **Updates**: Sets verification_status, method, confidence, details

### Phase 4: Expiry Monitoring ✅ *(Previously Implemented)*

- **Cron Job**: `GET /api/cron/check-expiries`
- **Schedule**: Daily at 9 AM (via Vercel cron)
- **Alerts**: 90-day, 30-day, 7-day, and expired notifications
- **Deduplication**: Prevents duplicate alerts
- **Email**: Uses Resend API for transactional emails

### Phase 5: Re-verification & Manual Review ✅

#### Monthly Re-verification
- **Cron Job**: `GET /api/cron/re-verify`
- **Schedule**: Monthly on 1st at 3 AM (via Vercel cron)
- **Logic**:
  - Re-verifies all VERIFIED certificates every 30 days
  - Detects revoked/invalid certificates
  - Sends alerts for revoked certificates
  - Flags for manual review if verification fails

#### Manual Review Queue
- **API Endpoints**:
  - `GET /api/certifications/review` - Get pending reviews
  - `POST /api/certifications/review` - Approve/reject certificate
- **UI**: `/dashboard/review` - Review queue page with approve/reject actions
- **Features**:
  - Shows certificates flagged for review
  - Displays extraction confidence scores
  - Allows adding review notes
  - Updates verification status to VERIFIED or FAILED

## Database Schema Changes

### Brand Table
```sql
gmail_refresh_token  TEXT
gmail_token_expiry   TIMESTAMP(3)
gmail_connected_at   TIMESTAMP(3)
```

### Certification Table
```sql
certificate_number       TEXT
document_hash            TEXT (for deduplication)
extracted_data           JSONB (raw OCR/NLP results)
extraction_confidence    DOUBLE PRECISION (0-1)
needs_review             BOOLEAN
verification_status      VerificationStatus (UNVERIFIED, PENDING, VERIFIED, FAILED)
verification_method      VerificationMethod (MANUAL, API, WEB_SCRAPING, LIST_MATCHING)
verification_confidence  DOUBLE PRECISION (0-1)
verification_date        TIMESTAMP(3)
verification_details     JSONB
last_verified_at         TIMESTAMP(3)
email_import_id          TEXT (foreign key)
```

### New Tables

#### EmailImport
```sql
id                TEXT PRIMARY KEY
brand_id          TEXT (foreign key)
gmail_message_id  TEXT UNIQUE
sender_email      TEXT
sender_name       TEXT
subject           TEXT
received_date     TIMESTAMP(3)
attachment_count  INTEGER
status            ImportStatus (PENDING, PROCESSING, COMPLETED, FAILED)
error_message     TEXT
processed_at      TIMESTAMP(3)
created_at        TIMESTAMP(3)
```

#### GmailWatchState
```sql
id          TEXT PRIMARY KEY
brand_id    TEXT UNIQUE (foreign key)
history_id  TEXT
expiration  TIMESTAMP(3)
created_at  TIMESTAMP(3)
updated_at  TIMESTAMP(3)
```

## Environment Variables

Add to `.env`:

```bash
# Gmail OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/gmail/callback

# AWS S3 (for certificate storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# Cron Secret (for securing cron endpoints)
CRON_SECRET=your_random_secret
```

## Usage Workflow

### 1. Connect Gmail
1. User navigates to Settings
2. Clicks "Connect Gmail"
3. OAuth flow redirects to Google
4. Callback stores refresh_token in database

### 2. Import Certificates
1. User triggers import (manual or scheduled)
2. System fetches emails with attachments
3. Downloads attachments to S3
4. Runs OCR/NLP extraction
5. Creates certification records
6. Auto-creates suppliers if needed

### 3. Review Pending Certificates
1. User navigates to /dashboard/review
2. Reviews certificates with low confidence
3. Approves or rejects with optional notes
4. System updates verification status

### 4. Automated Verification
1. System runs verification engine on new certificates
2. Routes to appropriate verifier by type
3. Updates verification status, method, confidence
4. Flags for manual review if needed

### 5. Re-verification (Monthly)
1. Cron job runs monthly
2. Re-verifies all VERIFIED certificates
3. Detects revocations
4. Sends alerts for revoked certificates

## Component Structure

```
lib/
├── gmail.ts                    # Gmail OAuth & API integration
├── extraction.ts               # OCR/NLP text extraction
└── verification/
    ├── index.ts                # Verification router
    ├── sa8000-verifier.ts      # SA8000 list matching
    ├── gots-verifier.ts        # GOTS placeholder
    └── oekotex-verifier.ts     # OEKO-TEX placeholder

app/api/
├── auth/gmail/
│   ├── route.ts                # Initiate OAuth
│   └── callback/route.ts       # OAuth callback
├── email-import/route.ts       # Import emails
├── certifications/
│   ├── verify/route.ts         # Manual verification
│   └── review/route.ts         # Review queue API
└── cron/
    ├── check-expiries/route.ts # Expiry monitoring
    └── re-verify/route.ts      # Monthly re-verification

components/
├── review/
│   └── review-queue-client.tsx # Review queue UI
└── certifications/
    └── verification-badge.tsx  # Verification status badge
```

## Future Enhancements (Phase 6)

- [ ] Complete GOTS API/scraping integration
- [ ] Complete OEKO-TEX web scraping integration
- [ ] Add more certification types (BSCI, Fair Wear, ISO14001)
- [ ] Advanced dashboard with statistics and charts
- [ ] Export functionality (PDF, Excel, CSV)
- [ ] Expiry timeline visualization
- [ ] Bulk import/export features
- [ ] Supplier risk scoring
- [ ] Document version tracking

## Security Considerations

1. **OAuth Tokens**: Refresh tokens are encrypted at rest in database
2. **Cron Jobs**: Protected with CRON_SECRET bearer token
3. **File Uploads**: Limited to 10MB, validated file types
4. **API Endpoints**: All require authentication via Clerk
5. **S3 Access**: Pre-signed URLs for temporary access

## Testing

To test the implementation:

1. **Gmail OAuth**:
   ```bash
   curl http://localhost:3000/api/auth/gmail
   # Follow OAuth flow in browser
   ```

2. **Email Import**:
   ```bash
   curl -X POST http://localhost:3000/api/email-import \
     -H "Cookie: your_auth_cookie" \
     -d '{"maxEmails": 5}'
   ```

3. **Manual Verification**:
   ```bash
   curl -X POST http://localhost:3000/api/certifications/verify \
     -H "Cookie: your_auth_cookie" \
     -d '{"certificationId": "cert_id"}'
   ```

4. **Cron Jobs** (locally):
   ```bash
   # Expiry check
   curl http://localhost:3000/api/cron/check-expiries \
     -H "Authorization: Bearer your_cron_secret"
   
   # Re-verification
   curl http://localhost:3000/api/cron/re-verify \
     -H "Authorization: Bearer your_cron_secret"
   ```

## Support

For questions or issues related to MVP features, please:
1. Check this documentation
2. Review the source code comments
3. Create an issue on GitHub
