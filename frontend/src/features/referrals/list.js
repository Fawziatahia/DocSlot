import { api } from "../../lib/api.js";
import { formatDate } from "../../lib/format.js";
import { renderDataTable, pageHrefBuilder } from "../../components/data-table.js";
import { escapeHtml } from "../../lib/escape.js";

export async function renderReferralsList() {
  const search = new URLSearchParams(window.location.search);
  const type = search.get("type") === "sent" ? "sent" : "received";
  const page = search.get("page") || 1;

  const { data: referrals, meta } = await api.get("/referrals/my", { type, page, per_page: 15 });

  const tabs = `
    <a href="/referrals?type=received" data-link class="nav-link ${type === "received" ? "active" : ""}">Received</a>
    <a href="/referrals?type=sent" data-link class="nav-link ${type === "sent" ? "active" : ""}">Sent</a>
  `;

  const rows = referrals.length
    ? referrals
        .map((r) => {
          const otherDoctor = type === "sent" ? r.receiving_doctor : r.referring_doctor;
          return `
            <tr>
              <td>
                <a href="/patients/${r.patient?.public_id}" data-link>${escapeHtml(r.patient?.name)}</a>
              </td>
              <td>${escapeHtml(otherDoctor?.name || "—")}</td>
              <td>${escapeHtml(r.note || "—")}</td>
              <td>${formatDate(r.created_at)}</td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="4" class="text-center text-muted py-4">No referrals here.</td></tr>`;

  return `
    <h2 class="h4 mb-3">Referrals</h2>
    <ul class="nav nav-pills mb-3">${tabs}</ul>
    ${renderDataTable({
      headers: ["Patient", type === "sent" ? "Referred To" : "Referred By", "Note", "Date"],
      body: rows,
      meta,
      pageHref: pageHrefBuilder("/referrals", { type }),
      showAlert: false,
    })}
  `;
}
