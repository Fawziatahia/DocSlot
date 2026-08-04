import { isAuthenticated, hasRole, getUser } from "./api.js";
import { escapeHtml } from "./escape.js";

const routes = [];
const appEl = () => document.querySelector("#app");

/**
 * @param {string} path e.g. "/doctors/:id"
 * @param {object} config
 * @param {(params: Record<string,string>) => Promise<string>|string} config.render
 * @param {(content: string) => Promise<string>|string} [config.layout]
 * @param {(params: Record<string,string>) => string} [config.redirect] send elsewhere instead of rendering
 * @param {boolean} [config.auth] require login
 * @param {string[]} [config.roles] require one of these roles
 */
export function route(path, config) {
  const paramNames = [];
  const pattern = path
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramNames.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");

  routes.push({ regex: new RegExp(`^${pattern}$`), paramNames, ...config });
}

function matchRoute(pathname) {
  for (const r of routes) {
    const match = pathname.match(r.regex);
    if (match) {
      const params = {};
      r.paramNames.forEach((name, i) => (params[name] = decodeURIComponent(match[i + 1])));
      return { route: r, params };
    }
  }
  return null;
}

// Matches the dynamic-import failure messages browsers throw when a chunk
// request 404s or times out (e.g. Vite/Rollup's "Failed to fetch dynamically
// imported module", Firefox's "error loading dynamically imported module"),
// as opposed to a real error thrown from within a successfully-loaded module.
function isChunkLoadError(err) {
  return /dynamically imported module|importing a module script failed/i.test(err?.message || "");
}

async function render() {
  const { pathname } = window.location;
  const matched = matchRoute(pathname);
  let hasRetried = false;

  if (!matched) {
    appEl().innerHTML = `<div class="container py-5 text-center"><h1>404</h1><p>Page not found.</p><a href="/" data-link>Go home</a></div>`;
    return;
  }

  const { route: matchedRoute, params } = matched;

  if (matchedRoute.redirect) {
    return navigate(matchedRoute.redirect(params), true);
  }

  if (matchedRoute.auth && !isAuthenticated()) {
    return navigate("/login", true);
  }
  if (matchedRoute.auth && getUser()?.must_change_password && pathname !== "/change-password") {
    return navigate("/change-password", true);
  }
  if (matchedRoute.roles && !hasRole(...matchedRoute.roles)) {
    return navigate("/dashboard", true);
  }

  // Without this, a failing render leaves the previous page on screen and the
  // click that triggered it looks like it did nothing at all.
  let content;
  try {
    content = await matchedRoute.render(params);
  } catch (err) {
    // A route's dynamic import() can fail on a transient network blip, or
    // because a new deploy removed the chunk this page still has hashed in
    // its URL — retrying once (with a cache-busting reload as a last resort)
    // recovers both without bothering the user with an error page.
    if (isChunkLoadError(err) && !hasRetried) {
      hasRetried = true;
      try {
        content = await matchedRoute.render(params);
      } catch {
        window.location.reload();
        return;
      }
    } else {
      appEl().innerHTML = `
        <div class="container py-5 text-center">
          <h1 class="h4">Couldn't load this page</h1>
          <p class="text-muted">${escapeHtml(err?.message || "Something went wrong.")}</p>
          <a href="/dashboard" data-link class="btn btn-outline-primary">Back to dashboard</a>
        </div>`;
      console.error(`Failed to render ${pathname}:`, err);
      return;
    }
  }

  const output = matchedRoute.layout ? await matchedRoute.layout(content) : content;
  appEl().innerHTML = output;
  window.scrollTo(0, 0);

  try {
    await matchedRoute.after?.(params);
  } catch (err) {
    console.error(`Failed to initialise ${pathname}:`, err);
  }

  document.dispatchEvent(new CustomEvent("route:rendered", { detail: { pathname, params } }));
}

export async function navigate(path, replace = false) {
  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }
  await render();
}

export function startRouter() {
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (!link) return;
    e.preventDefault();
    navigate(link.getAttribute("href"));
  });
  window.addEventListener("popstate", render);
  render();
}
