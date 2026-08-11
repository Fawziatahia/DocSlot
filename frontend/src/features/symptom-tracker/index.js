import { api } from "../../lib/api.js";
import { formatDate } from "../../lib/format.js";
import { renderPagination } from "../../components/pagination.js";
import { renderDoctorCard } from "../../components/doctor-card.js";
import { escapeHtml } from "../../lib/escape.js";
import { showModal } from "../../lib/modal.js";

const URGENCY_BADGE = {
  emergency: "bg-danger-subtle text-danger-emphasis",
  high: "bg-warning-subtle text-warning-emphasis",
  medium: "bg-info-subtle text-info-emphasis",
  low: "bg-success-subtle text-success-emphasis",
};

function pageHref(page) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", page);
  return `/symptom-checker?${params.toString()}`;
}

function renderHistoryItem(check) {
  const urgency = check.urgency
    ? `<span class="badge ${URGENCY_BADGE[check.urgency] || "bg-secondary-subtle text-secondary-emphasis"} ms-2">${escapeHtml(check.urgency)}</span>`
    : "";

  return `
    <div class="border-bottom py-3">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">${escapeHtml(check.symptoms)}</div>
          <div class="text-muted small mt-1">
            ${formatDate(check.created_at)}${check.specialization ? ` &middot; ${escapeHtml(check.specialization.name)}` : ""}
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          ${urgency}
          <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${check.id}" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

async function renderHistory() {
  const search = new URLSearchParams(window.location.search);
  const { data: checks, meta } = await api.get("/symptom-checks", { page: search.get("page") || 1, per_page: 10 });

  const items = checks.length
    ? checks.map(renderHistoryItem).join("")
    : `<div class="text-center text-muted py-4">No symptom checks yet.</div>`;

  return `
    <div id="symptom-history-list">${items}</div>
    ${renderPagination(meta, pageHref)}
  `;
}

export async function renderSymptomTracker() {
  const history = await renderHistory();

  return `
    <h2 class="h4 mb-3">Symptom Checker</h2>

    <div class="section-card mb-4">
      <p class="text-muted small mb-3">
        Describe how you're feeling and our AI assistant will give you general guidance and suggest
        which specialist to see. This is not a medical diagnosis &mdash; always confirm with a licensed doctor.
      </p>

      <form id="symptom-form">
        <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
        <div class="mb-3">
          <label class="form-label" for="symptoms">Your symptoms</label>
          <textarea
            class="form-control"
            id="symptoms"
            name="symptoms"
            rows="4"
            minlength="10"
            maxlength="1000"
            required
            placeholder="e.g. I've had a mild fever and sore throat for the past two days..."
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary" id="symptom-submit">
          <i class="bi bi-stars me-1"></i>Analyze Symptoms
        </button>
      </form>

      <div id="symptom-result" class="mt-4 d-none">
        <div class="section-card bg-body-secondary" id="symptom-answer" style="white-space: pre-wrap;"></div>
        <div id="symptom-cta" class="mt-3"></div>
      </div>
    </div>

    <div class="section-card">
      <h3 class="h6 mb-3">Recent Checks</h3>
      <div id="symptom-history">${history}</div>
    </div>
  `;
}

export function afterSymptomTracker() {
  const form = document.getElementById("symptom-form");
  const alertBox = form?.querySelector("[data-form-alert]");
  const submitBtn = document.getElementById("symptom-submit");
  const textarea = document.getElementById("symptoms");
  const resultBox = document.getElementById("symptom-result");
  const answerBox = document.getElementById("symptom-answer");
  const ctaBox = document.getElementById("symptom-cta");

  async function refreshHistory() {
    const historyBox = document.getElementById("symptom-history");
    if (historyBox) historyBox.innerHTML = await renderHistory();
  }

  document.getElementById("symptom-history")?.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action='delete']");
    if (!button) return;

    showModal({
      variant: "danger",
      title: "Delete Symptom Check?",
      message: "This will permanently remove this symptom check and its AI response. This can't be undone.",
      primaryLabel: "Delete",
      secondaryLabel: "Cancel",
      onPrimary: async () => {
        button.disabled = true;
        try {
          await api.delete(`/symptom-checks/${button.dataset.id}`);
          await refreshHistory();
        } catch (err) {
          alertBox.textContent = err.message || "Couldn't delete this entry.";
          alertBox.classList.remove("d-none");
          button.disabled = false;
        }
      },
    });
  });

  async function loadMatchingDoctors(specialization) {
    ctaBox.innerHTML = `<div class="text-muted small"><span class="spinner-border spinner-border-sm me-1"></span>Finding ${escapeHtml(specialization.name)} specialists...</div>`;

    try {
      const { data: doctors } = await api.get("/doctors", { specialization_id: specialization.id, per_page: 3 });

      if (!doctors.length) {
        ctaBox.innerHTML = `<div class="text-muted small">No ${escapeHtml(specialization.name)} specialists are available right now.</div>`;
        return;
      }

      ctaBox.innerHTML = `
        <div class="fw-semibold small text-muted mb-2">Recommended: ${escapeHtml(specialization.name)}</div>
        <div class="row g-3 mb-2">${doctors.map(renderDoctorCard).join("")}</div>
        <a href="/doctors?specialization_id=${specialization.id}" data-link class="small">See all ${escapeHtml(specialization.name)} specialists <i class="bi bi-arrow-right"></i></a>
      `;
    } catch {
      ctaBox.innerHTML = "";
    }
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const symptoms = textarea.value.trim();
    alertBox.classList.add("d-none");
    submitBtn.disabled = true;
    textarea.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Analyzing...`;
    resultBox.classList.remove("d-none");
    answerBox.textContent = "";
    ctaBox.innerHTML = "";

    let answer = "";

    try {
      await api.stream("/symptom-checks", { symptoms }, (event, payload) => {
        if (event === "message" && payload.delta) {
          answer += payload.delta;
          // textContent (not innerHTML) so streamed model output can never inject markup.
          answerBox.textContent = answer;
        }

        if (event === "error") {
          alertBox.textContent = payload.message || "Something went wrong.";
          alertBox.classList.remove("d-none");
        }

        if (event === "done") {
          if (payload.specialization) {
            loadMatchingDoctors(payload.specialization);
          }
          refreshHistory();
        }
      });
    } catch (err) {
      alertBox.textContent = err.message || "Couldn't analyze your symptoms right now.";
      alertBox.classList.remove("d-none");
    } finally {
      submitBtn.disabled = false;
      textarea.disabled = false;
      submitBtn.innerHTML = `<i class="bi bi-stars me-1"></i>Analyze Symptoms`;
      textarea.value = "";
    }
  });
}
