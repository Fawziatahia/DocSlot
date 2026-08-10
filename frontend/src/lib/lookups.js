import { api } from "./api.js";

// Departments/specializations barely ever change and get re-fetched on every
// doctor form/list render during a session — memoize per browser session so
// navigating between pages doesn't refire the same request. A failed request
// clears its own cache slot so the next call retries instead of being stuck.
let departmentsCache = null;
let specializationsCache = null;

export async function fetchDepartments() {
  if (!departmentsCache) {
    departmentsCache = api.get("/departments", { per_page: 100 }).then((r) => r.data);
    departmentsCache.catch(() => {
      departmentsCache = null;
    });
  }
  return departmentsCache;
}

export async function fetchSpecializations() {
  if (!specializationsCache) {
    specializationsCache = api.get("/specializations", { per_page: 100 }).then((r) => r.data);
    specializationsCache.catch(() => {
      specializationsCache = null;
    });
  }
  return specializationsCache;
}

// Called after admin create/update/toggle/delete so the next fetch above
// picks up the change instead of serving the stale cached list.
export function invalidateLookupsCache(resource) {
  if (resource === "departments") departmentsCache = null;
  else if (resource === "specializations") specializationsCache = null;
}
