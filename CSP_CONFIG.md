# Content Security Policy (CSP) Configuration

## Overview

SupplyVault uses Content Security Policy headers to enhance security and prevent XSS attacks. The CSP configuration is defined in `next.config.mjs`.

## Current Configuration

### Development Mode
- `unsafe-eval` is **enabled** (required for Next.js webpack hot reload)
- Allows dynamic script evaluation needed for development tools

### Production Mode
- `unsafe-eval` is **disabled** (more secure)
- Uses compiled/minified code that doesn't require eval
- Stricter security policy

## Allowed Sources

### Scripts
- `'self'` - Same origin scripts
- `'unsafe-inline'` - Inline scripts (required for Next.js)
- `https://*.clerk.com` - Clerk authentication
- `https://*.clerk.dev` - Clerk development
- `https://vercel.live` - Vercel live preview
- `'unsafe-eval'` - Only in development

### Styles
- `'self'` - Same origin styles
- `'unsafe-inline'` - Inline styles (required for Tailwind CSS)
- `https://fonts.googleapis.com` - Google Fonts

### Images
- `'self'` - Same origin images
- `data:` - Data URLs (for inline images)
- `blob:` - Blob URLs (for file previews)
- `https:` - All HTTPS sources (for S3 images)
- `http:` - HTTP sources (for development)

### Fonts
- `'self'` - Same origin fonts
- `data:` - Data URLs
- `https://fonts.gstatic.com` - Google Fonts CDN

### Connections
- `'self'` - Same origin API calls
- `https://*.clerk.com` - Clerk API
- `https://*.clerk.dev` - Clerk development API
- `https://*.vercel.app` - Vercel deployment URLs
- `https://*.vercel.com` - Vercel services
- `https://vitals.vercel-insights.com` - Vercel Analytics
- `wss://*.clerk.com` - WebSocket connections for Clerk

### Frames
- `'self'` - Same origin frames
- `https://*.clerk.com` - Clerk UI components
- `https://*.clerk.dev` - Clerk development UI

## Security Features

- ✅ `object-src 'none'` - Blocks plugins and objects
- ✅ `base-uri 'self'` - Restricts base tag URLs
- ✅ `form-action 'self'` - Only allows forms to submit to same origin
- ✅ `frame-ancestors 'none'` - Prevents clickjacking
- ✅ `upgrade-insecure-requests` - Upgrades HTTP to HTTPS (production only)

## Troubleshooting

### CSP Violations

If you see CSP errors in the browser console:

1. **Check the violation**: Look at the console error message
2. **Identify the source**: Note which directive is blocking
3. **Add to CSP**: Update `next.config.mjs` headers if legitimate

### Common Issues

**Issue**: "eval is blocked"
- **Solution**: This is expected in production. The error should only appear in development where `unsafe-eval` is allowed.

**Issue**: External script blocked
- **Solution**: Add the domain to the appropriate directive in `next.config.mjs`

**Issue**: Inline styles not working
- **Solution**: `'unsafe-inline'` is already allowed for styles. If issues persist, check for syntax errors.

## Best Practices

1. ✅ Use function references for `setTimeout`/`setInterval` (not string evaluation)
2. ✅ Avoid `eval()` and `new Function()` in application code
3. ✅ Use external scripts from trusted CDNs
4. ✅ Keep CSP strict in production
5. ✅ Test CSP changes in both dev and production builds

## Production Recommendations

For maximum security in production, consider:

1. Remove `'unsafe-inline'` from script-src if possible (requires refactoring)
2. Use nonces for inline scripts (advanced)
3. Report CSP violations to a logging service
4. Regularly review and update allowed domains

## References

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Test your CSP policy

