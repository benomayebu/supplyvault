import { CertificationType, VerificationStatus, VerificationMethod } from '@prisma/client';

/**
 * Verification result interface
 */
export interface VerificationResult {
  status: VerificationStatus;
  method: VerificationMethod;
  confidence: number; // 0-1
  verified: boolean;
  details: {
    certificateNumber?: string;
    issuingBody?: string;
    holderName?: string;
    validFrom?: Date;
    validUntil?: Date;
    scope?: string;
    notes?: string;
    [key: string]: any;
  };
}

/**
 * Base verifier interface
 */
export interface CertificationVerifier {
  /**
   * Verify a certification
   */
  verify(data: {
    certificateNumber?: string;
    companyName?: string;
    issuingBody?: string;
    issueDate?: Date;
    expiryDate?: Date;
  }): Promise<VerificationResult>;

  /**
   * Get supported certification types
   */
  getSupportedTypes(): CertificationType[];
}

/**
 * Verification router - routes verification requests to appropriate verifier
 */
export class VerificationRouter {
  private verifiers: Map<CertificationType, CertificationVerifier> = new Map();

  /**
   * Register a verifier for a certification type
   */
  registerVerifier(type: CertificationType, verifier: CertificationVerifier) {
    this.verifiers.set(type, verifier);
  }

  /**
   * Route verification to appropriate verifier
   */
  async verify(
    type: CertificationType,
    data: {
      certificateNumber?: string;
      companyName?: string;
      issuingBody?: string;
      issueDate?: Date;
      expiryDate?: Date;
    }
  ): Promise<VerificationResult> {
    const verifier = this.verifiers.get(type);

    if (!verifier) {
      // Fallback to manual review if no verifier available
      return {
        status: 'PENDING',
        method: 'MANUAL',
        confidence: 0,
        verified: false,
        details: {
          notes: 'No automated verifier available for this certification type. Manual review required.',
        },
      };
    }

    try {
      return await verifier.verify(data);
    } catch (error) {
      console.error(\`Verification failed for \${type}:\`, error);
      return {
        status: 'FAILED',
        method: 'MANUAL',
        confidence: 0,
        verified: false,
        details: {
          notes: \`Verification error: \${error instanceof Error ? error.message : 'Unknown error'}\`,
        },
      };
    }
  }
}

// Global verification router instance
export const verificationRouter = new VerificationRouter();

// Import and register verifiers
import { SA8000Verifier } from './sa8000-verifier';
import { GOTSVerifier } from './gots-verifier';
import { OekoTexVerifier } from './oekotex-verifier';

// Register all verifiers
const sa8000Verifier = new SA8000Verifier();
sa8000Verifier.getSupportedTypes().forEach(type => {
  verificationRouter.registerVerifier(type, sa8000Verifier);
});

const gotsVerifier = new GOTSVerifier();
gotsVerifier.getSupportedTypes().forEach(type => {
  verificationRouter.registerVerifier(type, gotsVerifier);
});

const oekoTexVerifier = new OekoTexVerifier();
oekoTexVerifier.getSupportedTypes().forEach(type => {
  verificationRouter.registerVerifier(type, oekoTexVerifier);
});
