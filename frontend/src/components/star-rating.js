export function renderStarInput(name = "score") {
  const stars = Array.from(
    { length: 5 },
    (_, i) => `<button type="button" class="star-input-btn" data-value="${i + 1}"><i class="bi bi-star"></i></button>`
  ).join("");

  return `
    <div class="star-input" data-name="${name}">
      ${stars}
      <input type="hidden" name="${name}" value="" />
    </div>
  `;
}

export function bindStarInput(container) {
  const buttons = Array.from(container.querySelectorAll(".star-input-btn"));
  const hiddenInput = container.querySelector('input[type="hidden"]');

  function paint(value) {
    buttons.forEach((btn) => {
      const icon = btn.querySelector("i");
      icon.className = Number(btn.dataset.value) <= value ? "bi bi-star-fill" : "bi bi-star";
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      hiddenInput.value = btn.dataset.value;
      paint(Number(btn.dataset.value));
    });
  });
}

export function renderStarDisplay(value, { max = 5, size = "" } = {}) {
  const rounded = Math.round(value || 0);
  const stars = Array.from(
    { length: max },
    (_, i) => `<i class="bi ${i < rounded ? "bi-star-fill" : "bi-star"} ${size}"></i>`
  ).join("");
  return `<span class="star-display text-warning">${stars}</span>`;
}
