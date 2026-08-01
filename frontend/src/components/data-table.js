import { renderPagination } from "./pagination.js";

export function pageHrefBuilder(path, extraParams = {}) {
  return (page) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(extraParams)) {
      params.set(key, value);
    }
    params.set("page", page);
    return `${path}?${params.toString()}`;
  };
}

export function renderDataTable({ headers, body, tbodyId, meta, pageHref, showAlert = true }) {
  const tbodyAttr = tbodyId ? ` id="${tbodyId}"` : "";

  return `
    <div class="section-card">
      ${showAlert ? `<div class="alert alert-danger d-none" data-list-alert role="alert"></div>` : ""}
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody${tbodyAttr}>${body}</tbody>
        </table>
      </div>
      ${renderPagination(meta, pageHref)}
    </div>
  `;
}
