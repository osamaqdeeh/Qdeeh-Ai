/**
 * Performance monitoring and optimization utilities
 */

// Simple performance logger for development
export function logPerformance(label: string, startTime?: number) {
  if (process.env.NODE_ENV === 'development' && startTime) {
    const duration = Date.now() - startTime;
    console.log(`⚡ [Performance] ${label}: ${duration}ms`);
  }
}

// Create a performance marker
export function performanceStart(): number {
  return Date.now();
}

// Cache helper with TTL (Time To Live)
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(
  key: string,
  ttlSeconds: number = 60
): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = (Date.now() - entry.timestamp) / 1000;
  if (age > ttlSeconds) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Batch database queries helper
export async function batchQueries<T>(
  queries: Array<() => Promise<T>>
): Promise<T[]> {
  const start = performanceStart();
  const results = await Promise.all(queries.map((query) => query()));
  logPerformance('Batch Queries', start);
  return results;
}

// Debounce helper for search/filter functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
}

// Throttle helper for scroll/resize events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
}
