import {
  PrismaClient,
  Prisma,
  SupplierType,
  CertificationStatus,
  CertificationType,
  AlertType,
} from "@prisma/client";

// PrismaClient singleton pattern for Next.js
// Prevents multiple instances in development with hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CreateSupplierInput = {
  brand_id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  country: string;
  address?: string;
  supplier_type: SupplierType;
};

export type UpdateSupplierInput = Partial<
  Omit<CreateSupplierInput, "brand_id">
>;

export type CreateCertificationInput = {
  supplier_id: string;
  certification_type: CertificationType;
  certification_name: string;
  issuing_body: string;
  issue_date: Date;
  expiry_date: Date;
  document_url: string;
  status?: CertificationStatus;
};

export type UpdateCertificationInput = Partial<
  Omit<CreateCertificationInput, "supplier_id">
>;

export type CreateAlertInput = {
  certification_id: string;
  brand_id: string;
  alert_type: AlertType;
  sent_at?: Date;
};

export type PaginationOptions = {
  skip?: number;
  take?: number;
};

// ============================================================================
// SUPPLIER FUNCTIONS
// ============================================================================

/**
 * Get all suppliers for a brand
 */
export async function getSuppliersByBrand(
  brandId: string,
  options?: PaginationOptions
) {
  try {
    return await prisma.supplier.findMany({
      where: {
        brand_id: brandId,
      },
      select: {
        id: true,
        name: true,
        contact_email: true,
        contact_phone: true,
        country: true,
        address: true,
        supplier_type: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            certifications: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: options?.skip,
      take: options?.take ?? 50,
    });
  } catch (error) {
    console.error("Error fetching suppliers by brand:", error);
    throw new Error("Failed to fetch suppliers");
  }
}

/**
 * Get a single supplier by ID
 */
export async function getSupplierById(supplierId: string) {
  try {
    return await prisma.supplier.findUnique({
      where: {
        id: supplierId,
      },
      include: {
        brand: {
          select: {
            id: true,
            company_name: true,
          },
        },
        certifications: {
          select: {
            id: true,
            certification_type: true,
            certification_name: true,
            expiry_date: true,
            status: true,
          },
          orderBy: {
            expiry_date: "asc",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching supplier by ID:", error);
    throw new Error("Failed to fetch supplier");
  }
}

/**
 * Create a new supplier
 */
export async function createSupplier(data: CreateSupplierInput) {
  try {
    return await prisma.supplier.create({
      data,
      select: {
        id: true,
        name: true,
        contact_email: true,
        contact_phone: true,
        country: true,
        address: true,
        supplier_type: true,
        brand_id: true,
        created_at: true,
        updated_at: true,
      },
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    throw new Error("Failed to create supplier");
  }
}

/**
 * Update an existing supplier
 */
export async function updateSupplier(
  supplierId: string,
  data: UpdateSupplierInput
) {
  try {
    return await prisma.supplier.update({
      where: {
        id: supplierId,
      },
      data,
      select: {
        id: true,
        name: true,
        contact_email: true,
        contact_phone: true,
        country: true,
        address: true,
        supplier_type: true,
        updated_at: true,
      },
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    throw new Error("Failed to update supplier");
  }
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(supplierId: string) {
  try {
    return await prisma.supplier.delete({
      where: {
        id: supplierId,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw new Error("Failed to delete supplier");
  }
}

/**
 * Search suppliers by name, email, or country
 */
export async function searchSuppliers(
  brandId: string,
  query: string,
  options?: PaginationOptions
) {
  try {
    return await prisma.supplier.findMany({
      where: {
        brand_id: brandId,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            contact_email: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            country: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        contact_email: true,
        contact_phone: true,
        country: true,
        supplier_type: true,
        _count: {
          select: {
            certifications: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip: options?.skip,
      take: options?.take ?? 50,
    });
  } catch (error) {
    console.error("Error searching suppliers:", error);
    throw new Error("Failed to search suppliers");
  }
}

// ============================================================================
// CERTIFICATION FUNCTIONS
// ============================================================================

/**
 * Get all certifications for a supplier
 */
export async function getCertificationsBySupplier(supplierId: string) {
  try {
    return await prisma.certification.findMany({
      where: {
        supplier_id: supplierId,
      },
      select: {
        id: true,
        certification_type: true,
        certification_name: true,
        issuing_body: true,
        issue_date: true,
        expiry_date: true,
        document_url: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        expiry_date: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching certifications by supplier:", error);
    throw new Error("Failed to fetch certifications");
  }
}

/**
 * Get a single certification by ID
 */
export async function getCertificationById(certificationId: string) {
  try {
    return await prisma.certification.findUnique({
      where: {
        id: certificationId,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            brand_id: true,
          },
        },
        alerts: {
          select: {
            id: true,
            alert_type: true,
            is_read: true,
            sent_at: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching certification by ID:", error);
    throw new Error("Failed to fetch certification");
  }
}

/**
 * Create a new certification
 */
export async function createCertification(data: CreateCertificationInput) {
  try {
    return await prisma.certification.create({
      data: {
        ...data,
        status: data.status ?? CertificationStatus.VALID,
      },
      select: {
        id: true,
        supplier_id: true,
        certification_type: true,
        certification_name: true,
        issuing_body: true,
        issue_date: true,
        expiry_date: true,
        document_url: true,
        status: true,
        created_at: true,
      },
    });
  } catch (error) {
    console.error("Error creating certification:", error);
    throw new Error("Failed to create certification");
  }
}

/**
 * Update an existing certification
 */
export async function updateCertification(
  certificationId: string,
  data: UpdateCertificationInput
) {
  try {
    return await prisma.certification.update({
      where: {
        id: certificationId,
      },
      data,
      select: {
        id: true,
        certification_type: true,
        certification_name: true,
        issuing_body: true,
        issue_date: true,
        expiry_date: true,
        document_url: true,
        status: true,
        updated_at: true,
      },
    });
  } catch (error) {
    console.error("Error updating certification:", error);
    throw new Error("Failed to update certification");
  }
}

/**
 * Delete a certification
 */
export async function deleteCertification(certificationId: string) {
  try {
    return await prisma.certification.delete({
      where: {
        id: certificationId,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    console.error("Error deleting certification:", error);
    throw new Error("Failed to delete certification");
  }
}

/**
 * Get certifications expiring within a specified number of days
 */
export async function getExpiringCertifications(
  brandId: string,
  daysUntilExpiry: number
) {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

    return await prisma.certification.findMany({
      where: {
        supplier: {
          brand_id: brandId,
        },
        expiry_date: {
          lte: expiryDate,
        },
        status: {
          not: CertificationStatus.EXPIRED,
        },
      },
      select: {
        id: true,
        certification_type: true,
        certification_name: true,
        expiry_date: true,
        status: true,
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        expiry_date: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching expiring certifications:", error);
    throw new Error("Failed to fetch expiring certifications");
  }
}

/**
 * Get all certifications for a brand with pagination and filters
 */
export async function getAllCertifications(
  brandId: string,
  options?: {
    search?: string;
    status?: CertificationStatus;
    skip?: number;
    take?: number;
    sortBy?: "certification_name" | "expiry_date" | "created_at";
    sortOrder?: "asc" | "desc";
  }
) {
  try {
    const where: Prisma.CertificationWhereInput = {
      supplier: {
        brand_id: brandId,
      },
    };

    if (options?.search) {
      where.OR = [
        {
          certification_name: { contains: options.search, mode: "insensitive" },
        },
        // Note: certification_type is an enum in the schema; we don't perform
        // a substring search on enums. Searching by certification_name,
        // issuing_body, and supplier name is sufficient for full-text-like
        // behavior here.
        {
          issuing_body: { contains: options.search, mode: "insensitive" },
        },
        {
          supplier: { name: { contains: options.search, mode: "insensitive" } },
        },
      ];
    }

    if (options?.status) {
      where.status = options.status;
    }

    const orderBy: Prisma.CertificationOrderByWithRelationInput = {};
    if (options?.sortBy) {
      const dir = options.sortOrder || "desc";
      (orderBy as any)[options.sortBy] = dir;
    } else {
      orderBy.expiry_date = "asc";
    }

    const [certifications, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        select: {
          id: true,
          certification_type: true,
          certification_name: true,
          issuing_body: true,
          issue_date: true,
          expiry_date: true,
          document_url: true,
          status: true,
          created_at: true,
          supplier: {
            select: {
              id: true,
              name: true,
              country: true,
            },
          },
        },
        orderBy,
        skip: options?.skip || 0,
        take: options?.take || 20,
      }),
      prisma.certification.count({ where }),
    ]);

    return {
      certifications,
      total,
      hasMore: (options?.skip || 0) + (options?.take || 20) < total,
    };
  } catch (error) {
    console.error("Error fetching all certifications:", error);
    throw new Error("Failed to fetch certifications");
  }
}

// ============================================================================
// ALERT FUNCTIONS
// ============================================================================

/**
 * Get all alerts for a brand
 */
export async function getAlertsByBrand(
  brandId: string,
  options?: PaginationOptions & { isRead?: boolean }
) {
  try {
    return await prisma.alert.findMany({
      where: {
        brand_id: brandId,
        ...(options?.isRead !== undefined && {
          is_read: options.isRead,
        }),
      },
      include: {
        certification: {
          select: {
            id: true,
            certification_name: true,
            certification_type: true,
            expiry_date: true,
            status: true,
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: options?.skip,
      take: options?.take ?? 50,
    });
  } catch (error) {
    console.error("Error fetching alerts by brand:", error);
    throw new Error("Failed to fetch alerts");
  }
}

/**
 * Create a new alert
 */
export async function createAlert(data: CreateAlertInput) {
  try {
    return await prisma.alert.create({
      data,
      select: {
        id: true,
        certification_id: true,
        brand_id: true,
        alert_type: true,
        sent_at: true,
        is_read: true,
        created_at: true,
      },
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    throw new Error("Failed to create alert");
  }
}

/**
 * Mark an alert as read
 */
export async function markAlertAsRead(alertId: string) {
  try {
    return await prisma.alert.update({
      where: {
        id: alertId,
      },
      data: {
        is_read: true,
      },
      select: {
        id: true,
        is_read: true,
      },
    });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    throw new Error("Failed to mark alert as read");
  }
}

/**
 * Get count of unread alerts for a brand
 */
export async function getUnreadAlertCount(brandId: string): Promise<number> {
  try {
    return await prisma.alert.count({
      where: {
        brand_id: brandId,
        is_read: false,
      },
    });
  } catch (error) {
    console.error("Error counting unread alerts:", error);
    throw new Error("Failed to count unread alerts");
  }
}
