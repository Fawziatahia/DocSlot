export function renderPagination(meta, buildHref) {
  if (!meta || meta.last_page <= 1) return "";

  const pages = [];
  for (let p = 1; p <= meta.last_page; p++) {
    pages.push(p);
  }

  const items = pages
    .map(
      (p) => `
      <li class="page-item ${p === meta.current_page ? "active" : ""}">
        <a class="page-link" href="${buildHref(p)}" data-link>${p}</a>
      </li>`
    )
    .join("");

  return `
    <nav aria-label="Pagination" class="mt-4">
      <ul class="pagination justify-content-center flex-wrap">
        <li class="page-item ${meta.current_page === 1 ? "disabled" : ""}">
          <a class="page-link" href="${buildHref(Math.max(1, meta.current_page - 1))}" data-link>Previous</a>
        </li>
        ${items}
        <li class="page-item ${meta.current_page === meta.last_page ? "disabled" : ""}">
          <a class="page-link" href="${buildHref(Math.min(meta.last_page, meta.current_page + 1))}" data-link>Next</a>
        </li>
      </ul>
    </nav>
  `;
}
