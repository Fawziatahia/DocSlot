import { showModal } from "../../lib/modal.js";

/**
 * Shared cancel-appointment confirmation, used by both the appointments list
 * and the appointment detail page. Replaces the old window.prompt() reason
 * dialog with the app's styled popup.
 */
export function confirmCancelAppointment(onConfirm) {
  showModal({
    variant: "danger",
    title: "Cancel Appointment?",
    message: "This will cancel the appointment. You can optionally let them know why.",
    body: `
      <div class="mb-3 text-start">
        <label class="form-label small fw-semibold" for="cancel-reason">Reason (optional)</label>
        <textarea class="form-control" id="cancel-reason" rows="4" maxlength="500" placeholder="e.g. Schedule conflict"></textarea>
      </div>
    `,
    primaryLabel: "Cancel Appointment",
    secondaryLabel: "Keep Appointment",
    onPrimary: (overlay) => {
      const reason = overlay.querySelector("#cancel-reason")?.value.trim() || "";
      onConfirm(reason);
    },
  });
}
