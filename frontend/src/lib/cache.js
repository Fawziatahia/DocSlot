const PREFIX = "docslot_cache:";

// localStorage caps out around 5-10MB per origin, shared with the session
// token/user blob — refuse to cache anything that would eat a big chunk of
// that on its own (a huge list response gains little from caching anyway).
const MAX_ENTRY_BYTES = 100 * 1024;

function normalizedParams(params) {
  const clean = {};
  Object.keys(params || {})
    .sort()
    .forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") clean[key] = value;
    });
  return clean;
}

function keyFor(path, params) {
  const query = new URLSearchParams(normalizedParams(params)).toString();
  return `${PREFIX}${path}${query ? `?${query}` : ""}`;
}

/**
 * Returns the cached value for this GET request if a fresh (non-expired)
 * entry exists, otherwise null. Never throws — a corrupt entry, disabled
 * storage, or private-browsing quota error is treated as a cache miss.
 */
export function getCached(path, params) {
  try {
    const raw = localStorage.getItem(keyFor(path, params));
    if (!raw) return null;

    const { value, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(keyFor(path, params));
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

/**
 * Caches `value` for `ttlMs` milliseconds. Silently skips caching (never
 * throws) when the payload is too large or storage is unavailable/full —
 * caching is a nice-to-have, it must never be why a request fails.
 */
export function setCached(path, params, value, ttlMs) {
  try {
    const serialized = JSON.stringify({ value, expiresAt: Date.now() + ttlMs });
    if (serialized.length > MAX_ENTRY_BYTES) return;
    localStorage.setItem(keyFor(path, params), serialized);
  } catch {
    // Quota exceeded or storage disabled — nothing to do, just don't cache.
  }
}

/**
 * Clears every cached entry for `resourcePath` and anything nested under it
 * (e.g. invalidateResource("/appointments") clears "/appointments",
 * "/appointments/5", "/appointments?status=pending", ...). Call this after
 * any write (POST/PUT/PATCH/DELETE) so a stale read can never follow a
 * mutation — the resource itself, not the exact query, is what changed.
 */
export function invalidateResource(resourcePath) {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;

    const path = key.slice(PREFIX.length);
    if (path === resourcePath || path.startsWith(`${resourcePath}/`) || path.startsWith(`${resourcePath}?`)) {
      localStorage.removeItem(key);
    }
  }
}

/**
 * Wipes every cached API response. Called on logout — cached data is only
 * ever meant to live for the current session, never past it.
 */
export function clearAllCache() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) localStorage.removeItem(key);
  }
}
