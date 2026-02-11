#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Database Configuration and Onboarding Flow
 * 
 * This script validates:
 * 1. Environment configuration
 * 2. Database schema
 * 3. Prisma client setup
 * 4. API route logic
 * 5. Layout guard logic
 * 6. Onboarding flow completeness
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

function logTest(testName, passed, details = '') {
  const symbol = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`${symbol} ${testName}`, color);
  if (details) {
    log(`  ${details}`, 'yellow');
  }
}

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(testName, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result.passed) {
      passedTests++;
      logTest(testName, true, result.message);
    } else {
      failedTests++;
      logTest(testName, false, result.message);
    }
  } catch (error) {
    failedTests++;
    logTest(testName, false, `Error: ${error.message}`);
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

logSection('1. ENVIRONMENT CONFIGURATION TESTS');

test('Check .env.example has DATABASE_URL', () => {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const hasDatabaseUrl = envExample.includes('DATABASE_URL');
  return {
    passed: hasDatabaseUrl,
    message: hasDatabaseUrl ? 'DATABASE_URL documented' : 'DATABASE_URL missing'
  };
});

test('Check .env.example has DIRECT_URL', () => {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const hasDirectUrl = envExample.includes('DIRECT_URL');
  return {
    passed: hasDirectUrl,
    message: hasDirectUrl ? 'DIRECT_URL documented' : 'DIRECT_URL missing'
  };
});

test('Check .env.production.example exists', () => {
  const exists = fs.existsSync('.env.production.example');
  return {
    passed: exists,
    message: exists ? 'Production env template exists' : 'Missing production env template'
  };
});

test('Check .env.production.example has Neon examples', () => {
  const envProd = fs.readFileSync('.env.production.example', 'utf8');
  const hasNeonExamples = envProd.includes('neon.tech') && envProd.includes('-pooler');
  return {
    passed: hasNeonExamples,
    message: hasNeonExamples ? 'Neon connection examples present' : 'Missing Neon examples'
  };
});

test('Check .env.production.example has Clerk configuration', () => {
  const envProd = fs.readFileSync('.env.production.example', 'utf8');
  const hasClerk = envProd.includes('CLERK_SECRET_KEY') && envProd.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  return {
    passed: hasClerk,
    message: hasClerk ? 'Clerk config documented' : 'Missing Clerk config'
  };
});

logSection('2. DATABASE SCHEMA TESTS');

test('Check Prisma schema exists', () => {
  const exists = fs.existsSync('prisma/schema.prisma');
  return {
    passed: exists,
    message: exists ? 'Schema file exists' : 'Schema file missing'
  };
});

test('Check Prisma schema uses both DATABASE_URL and DIRECT_URL', () => {
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const hasUrl = schema.includes('url       = env("DATABASE_URL")');
  const hasDirectUrl = schema.includes('directUrl = env("DIRECT_URL")');
  const passed = hasUrl && hasDirectUrl;
  return {
    passed,
    message: passed ? 'Both connection URLs configured' : 'Missing connection URL configuration'
  };
});

test('Check Brand model has clerk_user_id', () => {
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const hasBrandModel = schema.includes('model Brand');
  const hasClerkUserId = schema.includes('clerk_user_id     String           @unique');
  const passed = hasBrandModel && hasClerkUserId;
  return {
    passed,
    message: passed ? 'Brand model properly configured' : 'Brand model missing clerk_user_id'
  };
});

test('Check Supplier model has clerk_user_id', () => {
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const hasSupplierModel = schema.includes('model Supplier');
  const hasClerkUserId = schema.includes('clerk_user_id       String?            @unique');
  const passed = hasSupplierModel && hasClerkUserId;
  return {
    passed,
    message: passed ? 'Supplier model properly configured' : 'Supplier model missing clerk_user_id'
  };
});

logSection('3. DATABASE CLIENT TESTS');

test('Check lib/db.ts exists', () => {
  const exists = fs.existsSync('lib/db.ts');
  return {
    passed: exists,
    message: exists ? 'Database client file exists' : 'Database client missing'
  };
});

test('Check Prisma client initialization', () => {
  const dbFile = fs.readFileSync('lib/db.ts', 'utf8');
  const hasExport = dbFile.includes('export const prisma');
  const hasDatasources = dbFile.includes('datasources:');
  const passed = hasExport && hasDatasources;
  return {
    passed,
    message: passed ? 'Prisma client properly initialized' : 'Prisma client configuration issue'
  };
});

logSection('4. API ROUTE TESTS');

test('Check suppliers/create API route exists', () => {
  const exists = fs.existsSync('app/api/suppliers/create/route.ts');
  return {
    passed: exists,
    message: exists ? 'Supplier creation API exists' : 'Missing supplier creation API'
  };
});

test('Check suppliers/create uses auth()', () => {
  const route = fs.readFileSync('app/api/suppliers/create/route.ts', 'utf8');
  const hasAuth = route.includes('await auth()');
  const hasUserId = route.includes('userId');
  const passed = hasAuth && hasUserId;
  return {
    passed,
    message: passed ? 'Supplier API uses Clerk auth' : 'Missing authentication'
  };
});

test('Check suppliers/create checks for existing profile', () => {
  const route = fs.readFileSync('app/api/suppliers/create/route.ts', 'utf8');
  const hasCheck = route.includes('existingSupplier') && route.includes('409');
  return {
    passed: hasCheck,
    message: hasCheck ? 'Duplicate check implemented' : 'Missing duplicate check'
  };
});

test('Check brands/create API route exists', () => {
  const exists = fs.existsSync('app/api/brands/create/route.ts');
  return {
    passed: exists,
    message: exists ? 'Brand creation API exists' : 'Missing brand creation API'
  };
});

test('Check brands/create uses auth()', () => {
  const route = fs.readFileSync('app/api/brands/create/route.ts', 'utf8');
  const hasAuth = route.includes('await auth()');
  const hasUserId = route.includes('userId');
  const passed = hasAuth && hasUserId;
  return {
    passed,
    message: passed ? 'Brand API uses Clerk auth' : 'Missing authentication'
  };
});

test('Check brands/create checks for existing profile', () => {
  const route = fs.readFileSync('app/api/brands/create/route.ts', 'utf8');
  const hasCheck = route.includes('existingBrand') && route.includes('409');
  return {
    passed: hasCheck,
    message: hasCheck ? 'Duplicate check implemented' : 'Missing duplicate check'
  };
});

logSection('5. LAYOUT GUARD TESTS');

test('Check supplier layout guard exists', () => {
  const exists = fs.existsSync('app/supplier/layout.tsx');
  return {
    passed: exists,
    message: exists ? 'Supplier layout guard exists' : 'Missing supplier layout guard'
  };
});

test('Check supplier layout uses database query', () => {
  const layout = fs.readFileSync('app/supplier/layout.tsx', 'utf8');
  const hasPrisma = layout.includes('prisma.supplier.findUnique');
  const hasClerkUserId = layout.includes('clerk_user_id: userId');
  const passed = hasPrisma && hasClerkUserId;
  return {
    passed,
    message: passed ? 'Supplier guard uses DB query' : 'Missing database query'
  };
});

test('Check supplier layout redirects to onboarding', () => {
  const layout = fs.readFileSync('app/supplier/layout.tsx', 'utf8');
  const hasRedirect = layout.includes('redirect("/onboarding")');
  return {
    passed: hasRedirect,
    message: hasRedirect ? 'Redirects to /onboarding if not found' : 'Missing redirect'
  };
});

test('Check brand layout guard exists', () => {
  const exists = fs.existsSync('app/brand/layout.tsx');
  return {
    passed: exists,
    message: exists ? 'Brand layout guard exists' : 'Missing brand layout guard'
  };
});

test('Check brand layout uses database query', () => {
  const layout = fs.readFileSync('app/brand/layout.tsx', 'utf8');
  const hasPrisma = layout.includes('prisma.brand.findUnique');
  const hasClerkUserId = layout.includes('clerk_user_id: userId');
  const passed = hasPrisma && hasClerkUserId;
  return {
    passed,
    message: passed ? 'Brand guard uses DB query' : 'Missing database query'
  };
});

test('Check brand layout redirects to onboarding', () => {
  const layout = fs.readFileSync('app/brand/layout.tsx', 'utf8');
  const hasRedirect = layout.includes('redirect("/onboarding")');
  return {
    passed: hasRedirect,
    message: hasRedirect ? 'Redirects to /onboarding if not found' : 'Missing redirect'
  };
});

logSection('6. ONBOARDING PAGE TESTS');

test('Check main onboarding page exists', () => {
  const exists = fs.existsSync('app/onboarding/page.tsx');
  return {
    passed: exists,
    message: exists ? 'Main onboarding page exists' : 'Missing main onboarding page'
  };
});

test('Check onboarding page has role selection', () => {
  const page = fs.readFileSync('app/onboarding/page.tsx', 'utf8');
  const hasSupplier = page.includes('SUPPLIER');
  const hasBrand = page.includes('BRAND');
  const passed = hasSupplier && hasBrand;
  return {
    passed,
    message: passed ? 'Role selection implemented' : 'Missing role selection'
  };
});

test('Check supplier onboarding page exists', () => {
  const exists = fs.existsSync('app/onboarding/supplier/page.tsx');
  return {
    passed: exists,
    message: exists ? 'Supplier onboarding page exists' : 'Missing supplier onboarding'
  };
});

test('Check brand onboarding page exists', () => {
  const exists = fs.existsSync('app/onboarding/brand/page.tsx');
  return {
    passed: exists,
    message: exists ? 'Brand onboarding page exists' : 'Missing brand onboarding'
  };
});

logSection('7. MIDDLEWARE TESTS');

test('Check middleware.ts exists', () => {
  const exists = fs.existsSync('middleware.ts');
  return {
    passed: exists,
    message: exists ? 'Middleware file exists' : 'Missing middleware'
  };
});

test('Check middleware uses clerkMiddleware', () => {
  const middleware = fs.readFileSync('middleware.ts', 'utf8');
  const hasClerkMiddleware = middleware.includes('clerkMiddleware');
  return {
    passed: hasClerkMiddleware,
    message: hasClerkMiddleware ? 'Uses clerkMiddleware' : 'Missing clerkMiddleware'
  };
});

test('Check middleware protects routes', () => {
  const middleware = fs.readFileSync('middleware.ts', 'utf8');
  const hasProtect = middleware.includes('auth.protect()');
  return {
    passed: hasProtect,
    message: hasProtect ? 'Route protection implemented' : 'Missing route protection'
  };
});

test('Check middleware redirects auth routes', () => {
  const middleware = fs.readFileSync('middleware.ts', 'utf8');
  const hasRedirect = middleware.includes('redirect') && middleware.includes('/onboarding');
  return {
    passed: hasRedirect,
    message: hasRedirect ? 'Auth redirect to onboarding configured' : 'Missing auth redirect'
  };
});

logSection('8. DOCUMENTATION TESTS');

test('Check DEPLOYMENT.md has Neon setup', () => {
  const deployment = fs.readFileSync('DEPLOYMENT.md', 'utf8');
  const hasNeon = deployment.includes('Neon') || deployment.includes('neon.tech');
  return {
    passed: hasNeon,
    message: hasNeon ? 'Neon setup documented' : 'Missing Neon documentation'
  };
});

test('Check DEPLOYMENT.md has Clerk configuration', () => {
  const deployment = fs.readFileSync('DEPLOYMENT.md', 'utf8');
  const hasClerkConfig = deployment.includes('Clerk Dashboard') || deployment.includes('After sign-up URL');
  return {
    passed: hasClerkConfig,
    message: hasClerkConfig ? 'Clerk config documented' : 'Missing Clerk documentation'
  };
});

test('Check ONBOARDING_FLOW_GUIDE.md exists', () => {
  const exists = fs.existsSync('ONBOARDING_FLOW_GUIDE.md');
  return {
    passed: exists,
    message: exists ? 'Onboarding guide exists' : 'Missing onboarding guide'
  };
});

test('Check DATABASE_CONFIG_FIX_SUMMARY.md exists', () => {
  const exists = fs.existsSync('DATABASE_CONFIG_FIX_SUMMARY.md');
  return {
    passed: exists,
    message: exists ? 'Config fix summary exists' : 'Missing config summary'
  };
});

logSection('9. VSCODE CONFIGURATION TESTS');

test('Check .vscode/settings.json does not reference db.prisma.io', () => {
  const settings = fs.readFileSync('.vscode/settings.json', 'utf8');
  const hasPrismaProxy = settings.includes('db.prisma.io');
  return {
    passed: !hasPrismaProxy,
    message: !hasPrismaProxy ? 'No Prisma Data Proxy reference' : 'Still references Prisma Data Proxy'
  };
});

logSection('10. GITIGNORE TESTS');

test('Check .gitignore allows .env.production.example', () => {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const allowsProductionExample = gitignore.includes('!.env.production.example');
  return {
    passed: allowsProductionExample,
    message: allowsProductionExample ? 'Production example allowed' : 'Production example not allowed'
  };
});

test('Check .gitignore blocks .env files', () => {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const blocksEnv = gitignore.includes('.env*');
  return {
    passed: blocksEnv,
    message: blocksEnv ? 'Env files properly ignored' : 'Env files not ignored'
  };
});

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

logSection('TEST RESULTS SUMMARY');

console.log('');
log(`Total Tests:  ${totalTests}`, 'cyan');
log(`Passed:       ${passedTests}`, 'green');
log(`Failed:       ${failedTests}`, failedTests > 0 ? 'red' : 'green');
console.log('');

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
log(`Success Rate: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');

console.log('\n' + '='.repeat(70));

if (failedTests === 0) {
  log('✓ ALL TESTS PASSED!', 'green');
  log('The database configuration and onboarding flow are properly set up.', 'green');
  process.exit(0);
} else {
  log('✗ SOME TESTS FAILED', 'red');
  log('Please review the failed tests above and make necessary corrections.', 'yellow');
  process.exit(1);
}
