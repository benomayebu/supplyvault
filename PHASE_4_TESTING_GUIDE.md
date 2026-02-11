# Phase 4 Testing Guide

## Pre-Testing Setup

### 1. AWS S3 Configuration

Before testing, you need to configure AWS S3:

```bash
# 1. Create an S3 bucket in AWS Console
# - Bucket name: supplyvault-certificates-dev (or your choice)
# - Region: us-east-1 (or your preferred region)
# - Block all public access: ENABLED
# - Bucket versioning: ENABLED
# - Default encryption: ENABLED (SSE-S3)

# 2. Create IAM User
# - User name: supplyvault-s3-user
# - Attach policy: AmazonS3FullAccess (or custom policy)

# 3. Create access keys for the IAM user
# - Save the Access Key ID and Secret Access Key

# 4. Add to .env.local:
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=supplyvault-certificates-dev
```

### 2. Alternative: Test Without S3

If you don't have AWS configured, the system will fail gracefully with error messages. You can still test the UI and form validation.

## Test Cases

### Test 1: Upload Certification Without File

**Steps:**
1. Navigate to `/supplier/certifications/upload`
2. Fill in all required fields:
   - Certification Type: Select any type
   - Certification Name: "Test Certification"
   - Issuing Body: "Test Body"
   - Issue Date: Today's date
   - Expiry Date: Future date
3. Do NOT select a file
4. Click "Upload Certification"

**Expected Result:**
- ✅ Certification created successfully
- ✅ Redirected to dashboard
- ✅ Certification appears in "Recent Certifications"
- ✅ NO "Document" badge shown (no file attached)

### Test 2: Upload Certification With PDF File

**Steps:**
1. Navigate to `/supplier/certifications/upload`
2. Fill in all required fields
3. Select a PDF file (< 10MB)
4. Verify file preview shows: "filename.pdf (X.XX MB)"
5. Click "Upload Certification"

**Expected Result:**
- ✅ File upload progress shown
- ✅ Certification created with document
- ✅ Redirected to dashboard
- ✅ Green "Document" badge shown next to certification

**If AWS not configured:**
- ❌ Error: "AWS_S3_BUCKET_NAME environment variable is not set"
- Certification NOT created (rollback works)

### Test 3: Upload Certification With Image File

**Steps:**
1. Upload form
2. Select a JPG or PNG file (< 10MB)
3. Submit

**Expected Result:**
- ✅ Same as Test 2 for images

### Test 4: File Validation - Size Limit

**Steps:**
1. Upload form
2. Select a file > 10MB
3. Submit

**Expected Result:**
- ❌ Error: "File size exceeds 10MB limit"
- Certification NOT created

### Test 5: File Validation - File Type

**Steps:**
1. Upload form
2. Select a .docx or .txt file
3. Submit

**Expected Result:**
- ❌ Error: "Invalid file type. Please upload PDF, JPG, or PNG"
- Certification NOT created

### Test 6: View Certification with Document

**Steps:**
1. Create a certification with a file (from Test 2)
2. Go to dashboard
3. Click on the certification name
4. View certification detail page

**Expected Result:**
- ✅ Certification details displayed
- ✅ Document viewer loads
- ✅ Can view PDF in iframe OR image displayed
- ✅ Download button works
- ✅ Print button works

### Test 7: View Certification without Document

**Steps:**
1. Create a certification without file (from Test 1)
2. Click on certification from dashboard
3. View detail page

**Expected Result:**
- ✅ Certification details displayed
- ✅ "No document uploaded" message shown
- ❌ Document viewer not shown

### Test 8: Document Access API - Owner Access

**Steps:**
1. Create certification with document
2. As the supplier owner, navigate to:
   `/api/certifications/[cert-id]/document`

**Expected Result:**
- ✅ Returns signed URL (for S3) or direct URL (for local)
- ✅ URL is accessible

### Test 9: Document Access API - No Access

**Steps:**
1. Create certification as Supplier A
2. Log in as Supplier B (different user)
3. Try to access:
   `/api/certifications/[supplier-a-cert-id]/document`

**Expected Result:**
- ❌ 403 Forbidden error
- Error: "Access denied"

### Test 10: Dashboard Indicators

**Steps:**
1. Create multiple certifications (mix with and without docs)
2. View dashboard

**Expected Result:**
- ✅ Certifications with documents show green "Document" badge
- ✅ Certifications without documents have no badge
- ✅ All certifications are clickable
- ✅ Arrow icon shown on hover

## Manual Verification Checklist

### File Upload
- [ ] File upload field accepts PDF, JPG, PNG
- [ ] File size validation works (10MB limit)
- [ ] File type validation works
- [ ] File preview shows name and size
- [ ] Progress/loading state shown during upload

### S3 Integration (if configured)
- [ ] Files uploaded to S3 successfully
- [ ] S3 key format: `certifications/{supplier_id}/{cert_id}_{timestamp}_{filename}`
- [ ] Files stored with correct content type
- [ ] Bucket remains private (no public access)

### Document Viewing
- [ ] PDF files display in iframe
- [ ] Image files display correctly
- [ ] Download button works for all file types
- [ ] Print button opens print dialog
- [ ] Loading state shows while fetching document
- [ ] Error state shows if document fails to load

### Dashboard
- [ ] Document badge shows for certs with files
- [ ] No badge for certs without files
- [ ] Certifications are clickable
- [ ] Hover effects work
- [ ] Arrow icon indicates clickable items

### Security
- [ ] Supplier can only view own certifications
- [ ] Cannot access other suppliers' documents
- [ ] 403 error for unauthorized access
- [ ] Signed URLs expire (after 1 hour)

## Common Issues

### Issue: "AWS_S3_BUCKET_NAME environment variable is not set"
**Solution:** Add AWS environment variables to `.env.local`

### Issue: "Access Denied" when uploading to S3
**Solution:** Check IAM user permissions, ensure S3 bucket name is correct

### Issue: PDF not displaying
**Solution:** 
- Check browser console for errors
- Verify file was uploaded correctly
- Try opening signed URL directly in new tab

### Issue: Signed URL expired
**Solution:** Refresh the page to get new signed URL (1 hour expiry)

### Issue: File upload fails silently
**Solution:** 
- Check browser network tab for errors
- Check server logs
- Verify FormData is being sent correctly

## Performance Testing

### Test file sizes:
- [ ] 100 KB file - should upload quickly
- [ ] 1 MB file - should upload in 1-2 seconds
- [ ] 5 MB file - should upload in 3-5 seconds
- [ ] 10 MB file - should upload in 5-10 seconds

### Test concurrent uploads:
- [ ] Upload multiple files in different tabs
- [ ] All should complete successfully
- [ ] No conflicts or overwrites

## Browser Compatibility

Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Next Steps After Testing

1. ✅ Fix any bugs found during testing
2. ✅ Add production AWS credentials to Vercel
3. ✅ Test in production environment
4. ✅ Monitor S3 costs
5. ✅ Consider adding:
   - File upload progress bar
   - Image thumbnails
   - Document versioning
   - Bulk upload

## Success Criteria

Phase 4 is complete when:
- ✅ Files can be uploaded to S3
- ✅ Files can be viewed securely
- ✅ Dashboard shows document status
- ✅ All validation works correctly
- ✅ Security checks prevent unauthorized access
- ✅ Error handling is graceful
- ✅ User experience is smooth

Ready for Phase 5 (AI Parsing)!
