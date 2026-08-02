import { escapeHtml } from "../lib/escape.js";

const DEBOUNCE_MS = 250;

/**
 * A type-to-search picker for choosing one person by name or ID, replacing
 * the "paste the ID you already memorised" text boxes and the "load every
 * record into a <select>" dropdowns.
 *
 * The chosen record's id lands in a hidden input named `name`, so the picker
 * drops into an existing form without changing how it submits.
 */
export function renderEntityPicker({ id, name, label, placeholder = "Search by name or ID...", hint = "", selected = null }) {
  return `
    <div class="entity-picker" id="${id}">
      ${label ? `<label class="form-label" for="${id}-input">${escapeHtml(label)}</label>` : ""}
      <input type="hidden" name="${name}" value="${escapeHtml(selected?.value)}" />
      <div class="entity-picker-selected ${selected ? "" : "d-none"}">
        <span class="entity-picker-chip">
          <i class="bi bi-person-check"></i>
          <span data-picker-label>${escapeHtml(selected?.title)}</span>
          <button type="button" class="entity-picker-clear" aria-label="Clear selection">&times;</button>
        </span>
      </div>
      <div class="entity-picker-search ${selected ? "d-none" : ""}">
        <div class="search-field">
          <i class="bi bi-search search-field-icon"></i>
          <input
            type="search"
            class="form-control"
            id="${id}-input"
            placeholder="${escapeHtml(placeholder)}"
            autocomplete="off"
          />
          <span class="search-field-status" aria-hidden="true"></span>
        </div>
        <div class="entity-picker-results d-none" role="listbox"></div>
      </div>
      ${hint ? `<div class="form-text">${hint}</div>` : ""}
      <div class="invalid-feedback" data-server="${name}"></div>
    </div>
  `;
}

/**
 * @param {object} options
 * @param {string} options.id  the picker id passed to `renderEntityPicker`
 * @param {(query: string) => Promise<Array<{value: string, title: string, subtitle?: string}>>} options.search
 * @param {(option: object) => void} [options.onSelect]
 */
export function attachEntityPicker({ id, search, onSelect, delay = DEBOUNCE_MS }) {
  const root = document.getElementById(id);
  if (!root) return null;

  const hidden = root.querySelector('input[type="hidden"]');
  const searchBox = root.querySelector(".entity-picker-search");
  const field = searchBox.querySelector('input[type="search"]');
  const list = root.querySelector(".entity-picker-results");
  const selectedBox = root.querySelector(".entity-picker-selected");
  const selectedLabel = root.querySelector("[data-picker-label]");

  let timer = null;
  let latest = 0;
  let options = [];

  const closeList = () => {
    list.classList.add("d-none");
    list.innerHTML = "";
  };

  const select = (option) => {
    hidden.value = option.value;
    selectedLabel.textContent = option.title;
    selectedBox.classList.remove("d-none");
    searchBox.classList.add("d-none");
    root.querySelector(".is-invalid")?.classList.remove("is-invalid");
    closeList();
    onSelect?.(option);
  };

  const run = async (query) => {
    const ticket = ++latest;
    searchBox.classList.add("is-searching");

    try {
      options = await search(query);
      if (ticket !== latest) return;

      list.innerHTML = options.length
        ? options
            .map(
              (option, index) => `
                <button type="button" class="entity-picker-option" data-index="${index}" role="option">
                  <span class="entity-picker-option-title">${escapeHtml(option.title)}</span>
                  ${option.subtitle ? `<span class="entity-picker-option-subtitle">${escapeHtml(option.subtitle)}</span>` : ""}
                </button>
              `
            )
            .join("")
        : `<div class="entity-picker-empty">No matches for “${escapeHtml(query)}”.</div>`;
      list.classList.remove("d-none");
    } catch (err) {
      if (ticket !== latest) return;
      list.innerHTML = `<div class="entity-picker-empty">${escapeHtml(err.message || "Search failed.")}</div>`;
      list.classList.remove("d-none");
    } finally {
      if (ticket === latest) searchBox.classList.remove("is-searching");
    }
  };

  field.addEventListener("input", () => {
    clearTimeout(timer);
    const query = field.value.trim();
    if (query.length < 2) {
      latest += 1; // discard anything still in flight
      closeList();
      return;
    }
    timer = setTimeout(() => run(query), delay);
  });

  list.addEventListener("click", (e) => {
    const button = e.target.closest(".entity-picker-option");
    if (!button) return;
    select(options[Number(button.dataset.index)]);
  });

  root.querySelector(".entity-picker-clear")?.addEventListener("click", () => {
    hidden.value = "";
    field.value = "";
    selectedBox.classList.add("d-none");
    searchBox.classList.remove("d-none");
    closeList();
    field.focus();
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) closeList();
  });

  return { select, clear: () => root.querySelector(".entity-picker-clear")?.click() };
}
