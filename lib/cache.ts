/**
 * Server-side caching utilities
 * Using Next.js fetch cache with revalidate
 */

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
} as const;

/**
 * Create a cached fetch wrapper with revalidation
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  revalidate: number = CACHE_TTL.MEDIUM
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    next: {
      revalidate,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Cache key generator for consistent cache keys
 */
export function getCacheKey(
  prefix: string,
  ...args: (string | number)[]
): string {
  return `${prefix}:${args.join(":")}`;
}
