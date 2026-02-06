import { CertificationType } from '@prisma/client';
import { CertificationVerifier, VerificationResult } from './index';

/**
 * SA8000 Verifier - List matching approach
 * 
 * SA8000 certified facilities are publicly listed on the SAI (Social Accountability International) website
 * This verifier checks against a known list of certified facilities
 */
export class SA8000Verifier implements CertificationVerifier {
  // In a real implementation, this would be fetched from SAI's API or database
  // For now, using a sample list structure
  private certifiedFacilities: Map<string, {
    certificateNumber: string;
    companyName: string;
    validFrom: Date;
    validUntil: Date;
    scope: string;
  }> = new Map();

  constructor() {
    // Sample data - in production, this would be loaded from an external source
    // or fetched via API
    this.loadCertifiedFacilities();
  }

  private loadCertifiedFacilities() {
    // This is a placeholder. In production:
    // 1. Fetch from SAI API if available
    // 2. Or scrape from https://sa-intl.org/programs/sa8000/
    // 3. Or maintain a regularly updated database
    
    // Sample entries for demonstration
    const sampleCerts = [
      {
        certificateNumber: 'SA8000-2023-001',
        companyName: 'Sample Textile Factory Ltd',
        validFrom: new Date('2023-01-01'),
        validUntil: new Date('2026-01-01'),
        scope: 'Garment Manufacturing',
      },
    ];

    sampleCerts.forEach(cert => {
      this.certifiedFacilities.set(cert.certificateNumber.toUpperCase(), cert);
    });
  }

  getSupportedTypes(): CertificationType[] {
    return ['SA8000'];
  }

  async verify(data: {
    certificateNumber?: string;
    companyName?: string;
    issuingBody?: string;
    issueDate?: Date;
    expiryDate?: Date;
  }): Promise<VerificationResult> {
    // SA8000 verification is primarily based on certificate number lookup
    if (!data.certificateNumber) {
      return {
        status: 'PENDING',
        method: 'LIST_MATCHING',
        confidence: 0,
        verified: false,
        details: {
          notes: 'Certificate number is required for SA8000 verification',
        },
      };
    }

    const certNumber = data.certificateNumber.toUpperCase();
    const facility = this.certifiedFacilities.get(certNumber);

    if (facility) {
      // Check if certificate is still valid
      const now = new Date();
      const isValid = now >= facility.validFrom && now <= facility.validUntil;

      if (isValid) {
        // Additional validation: check company name match if provided
        let nameMatch = true;
        let confidence = 0.9; // High confidence for list match

        if (data.companyName) {
          const similarity = this.calculateStringSimilarity(
            data.companyName.toLowerCase(),
            facility.companyName.toLowerCase()
          );
          nameMatch = similarity > 0.7; // 70% similarity threshold
          confidence = similarity > 0.9 ? 1.0 : 0.85;
        }

        if (nameMatch) {
          return {
            status: 'VERIFIED',
            method: 'LIST_MATCHING',
            confidence,
            verified: true,
            details: {
              certificateNumber: facility.certificateNumber,
              holderName: facility.companyName,
              validFrom: facility.validFrom,
              validUntil: facility.validUntil,
              scope: facility.scope,
              issuingBody: 'Social Accountability International (SAI)',
              notes: 'Certificate verified against SA8000 certified facilities database',
            },
          };
        } else {
          return {
            status: 'FAILED',
            method: 'LIST_MATCHING',
            confidence: 0.3,
            verified: false,
            details: {
              certificateNumber: facility.certificateNumber,
              notes: \`Certificate number found but company name mismatch. Expected: \${facility.companyName}, Got: \${data.companyName}\`,
            },
          };
        }
      } else {
        return {
          status: 'FAILED',
          method: 'LIST_MATCHING',
          confidence: 0.9,
          verified: false,
          details: {
            certificateNumber: facility.certificateNumber,
            validFrom: facility.validFrom,
            validUntil: facility.validUntil,
            notes: 'Certificate found but has expired or not yet valid',
          },
        };
      }
    }

    // Certificate not found in database
    return {
      status: 'PENDING',
      method: 'LIST_MATCHING',
      confidence: 0,
      verified: false,
      details: {
        notes: 'Certificate number not found in SA8000 certified facilities database. Manual verification recommended.',
      },
    };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
