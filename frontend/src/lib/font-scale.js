/**
 * Accessibility text-size control. Every size in the app is expressed in rem,
 * so scaling the root font-size scales the whole UI proportionally. The chosen
 * level is remembered across visits.
 */
const KEY = "docslot_font_scale";
const STEPS = [90, 100, 112, 125]; // percent of the browser's default (16px)
const LABELS = ["Small", "Default", "Large", "Extra large"];
const DEFAULT_INDEX = 1;

function currentIndex() {
  const saved = parseInt(localStorage.getItem(KEY), 10);
  return Number.isInteger(saved) && saved >= 0 && saved < STEPS.length ? saved : DEFAULT_INDEX;
}

function apply(index) {
  document.documentElement.style.fontSize = `${STEPS[index]}%`;
}

// Apply the saved size immediately on import so there's no flash of default text.
apply(currentIndex());

export function initFontScale() {
  apply(currentIndex());

  if (document.getElementById("font-scale-control")) return;

  const el = document.createElement("div");
  el.id = "font-scale-control";
  el.className = "font-scale-control";
  el.setAttribute("role", "group");
  el.setAttribute("aria-label", "Text size");
  el.innerHTML = `
    <button type="button" class="fs-btn" data-fs="down" title="Smaller text" aria-label="Decrease text size">A<span class="fs-sign">−</span></button>
    <button type="button" class="fs-btn fs-reset" data-fs="reset" title="Reset text size" aria-label="Reset text size">A</button>
    <button type="button" class="fs-btn fs-up" data-fs="up" title="Larger text" aria-label="Increase text size">A<span class="fs-sign">+</span></button>
  `;
  document.body.appendChild(el);

  const sync = (index) => {
    localStorage.setItem(KEY, String(index));
    apply(index);
    el.querySelector('[data-fs="down"]').disabled = index === 0;
    el.querySelector('[data-fs="up"]').disabled = index === STEPS.length - 1;
    el.title = `Text size: ${LABELS[index]}`;
  };

  el.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fs]");
    if (!btn) return;
    let idx = currentIndex();
    if (btn.dataset.fs === "up") idx = Math.min(STEPS.length - 1, idx + 1);
    else if (btn.dataset.fs === "down") idx = Math.max(0, idx - 1);
    else idx = DEFAULT_INDEX;
    sync(idx);
  });

  sync(currentIndex());
}
