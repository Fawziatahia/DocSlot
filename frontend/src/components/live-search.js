import { escapeHtml } from "../lib/escape.js";

const DEBOUNCE_MS = 250;

/**
 * Search bar for list pages. There is deliberately no submit button — results
 * update as you type — but the form still submits on Enter for anyone who
 * expects it.
 *
 * `controls` is extra markup (selects, usually) rendered beside the field;
 * every named input inside the form is sent as a query parameter.
 */
export function renderSearchBar({ id, value = "", placeholder = "Search...", hint = "", controls = "" }) {
  return `
    <form class="search-bar" id="${id}" role="search" autocomplete="off">
      <div class="search-field">
        <i class="bi bi-search search-field-icon"></i>
        <input
          type="search"
          class="form-control"
          name="q"
          value="${escapeHtml(value)}"
          placeholder="${escapeHtml(placeholder)}"
          aria-label="${escapeHtml(placeholder)}"
        />
        <span class="search-field-status" aria-hidden="true"></span>
      </div>
      ${controls}
      ${hint ? `<p class="search-hint">${hint}</p>` : ""}
    </form>
  `;
}

/**
 * Wires a search bar to a results container: debounces typing, swaps only the
 * results markup (so the field keeps focus and the caret), mirrors the query
 * into the URL so it survives a refresh or a shared link, and drops responses
 * that arrive after a newer keystroke has already been sent.
 *
 * @param {object} options
 * @param {string} options.formId    id of the `renderSearchBar` form
 * @param {string} options.resultsId id of the container to refill — must be
 *   the stable wrapper, not the element being replaced, so delegated click
 *   handlers bound to it survive each update
 * @param {(params: Record<string,string>) => Promise<string>} options.render
 */
export function attachLiveSearch({ formId, resultsId, render, delay = DEBOUNCE_MS }) {
  const form = document.getElementById(formId);
  const results = document.getElementById(resultsId);
  if (!form || !results) return null;

  let timer = null;
  let latest = 0;

  const currentParams = () => {
    const params = {};
    new FormData(form).forEach((value, key) => {
      const trimmed = String(value).trim();
      if (trimmed) params[key] = trimmed;
    });
    return params;
  };

  // Searching resets paging, so `page` is intentionally dropped here.
  const syncUrl = (params) => {
    const query = new URLSearchParams(params).toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  };

  const run = async () => {
    const params = currentParams();
    const ticket = ++latest;
    form.classList.add("is-searching");
    syncUrl(params);

    try {
      const html = await render(params);
      if (ticket !== latest) return;
      results.innerHTML = html;
    } catch (err) {
      if (ticket !== latest) return;
      results.innerHTML = `<div class="alert alert-danger mb-0">${escapeHtml(err.message || "Couldn't run that search.")}</div>`;
    } finally {
      if (ticket === latest) form.classList.remove("is-searching");
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearTimeout(timer);
    run();
  });

  form.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(run, delay);
  });

  form.addEventListener("change", (e) => {
    if (e.target.tagName !== "SELECT") return;
    clearTimeout(timer);
    run();
  });

  return { refresh: run };
}
