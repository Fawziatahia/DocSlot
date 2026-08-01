import { isAuthenticated, hasRole, getUser } from "./api.js";

const routes = [];
const appEl = () => document.querySelector("#app");

/**
 * @param {string} path e.g. "/doctors/:id"
 * @param {object} config
 * @param {(params: Record<string,string>) => Promise<string>|string} config.render
 * @param {(content: string) => Promise<string>|string} [config.layout]
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

async function render() {
  const { pathname } = window.location;
  const matched = matchRoute(pathname);

  if (!matched) {
    appEl().innerHTML = `<div class="container py-5 text-center"><h1>404</h1><p>Page not found.</p><a href="/" data-link>Go home</a></div>`;
    return;
  }

  const { route: matchedRoute, params } = matched;

  if (matchedRoute.auth && !isAuthenticated()) {
    return navigate("/login", true);
  }
  if (matchedRoute.auth && getUser()?.must_change_password && pathname !== "/change-password") {
    return navigate("/change-password", true);
  }
  if (matchedRoute.roles && !hasRole(...matchedRoute.roles)) {
    return navigate("/dashboard", true);
  }

  const content = await matchedRoute.render(params);
  const output = matchedRoute.layout ? await matchedRoute.layout(content) : content;
  appEl().innerHTML = output;
  window.scrollTo(0, 0);
  await matchedRoute.after?.(params);
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
