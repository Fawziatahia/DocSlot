const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISODate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayISO() {
  const now = new Date();
  return toISODate(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Renders a month-grid calendar into `container`. Dates earlier than `minDate`
 * (inclusive lower bound) or later than `maxDate` (inclusive upper bound, optional,
 * both "YYYY-MM-DD") are shown greyed out and disabled; everything in between is
 * selectable. Calling `onSelect` fires with the chosen ISO date string.
 */
export function createDatePicker(container, { minDate, maxDate = null, onSelect, selectedDate = null }) {
  let selected = selectedDate;
  const minDateObj = new Date(`${minDate}T00:00:00`);
  const maxDateObj = maxDate ? new Date(`${maxDate}T00:00:00`) : null;
  let viewYear = minDateObj.getFullYear();
  let viewMonth = minDateObj.getMonth();
  const today = todayISO();

  function render() {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const canGoPrev = viewYear > minDateObj.getFullYear() || (viewYear === minDateObj.getFullYear() && viewMonth > minDateObj.getMonth());
    const canGoNext = !maxDateObj || viewYear < maxDateObj.getFullYear() || (viewYear === maxDateObj.getFullYear() && viewMonth < maxDateObj.getMonth());

    let cells = "";
    for (let i = 0; i < startWeekday; i++) {
      cells += `<div class="dp-cell dp-empty"></div>`;
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toISODate(viewYear, viewMonth, day);
      const disabled = iso < minDate || (maxDate && iso > maxDate);
      const classes = ["dp-cell", "dp-day"];
      if (disabled) classes.push("dp-disabled");
      if (iso === selected) classes.push("dp-selected");
      if (iso === today) classes.push("dp-today");
      cells += `<button type="button" class="${classes.join(" ")}" data-date="${iso}" ${disabled ? "disabled" : ""}>${day}</button>`;
    }

    container.innerHTML = `
      <div class="dp-calendar">
        <div class="dp-header">
          <button type="button" class="dp-nav" data-nav="prev" ${!canGoPrev ? "disabled" : ""} aria-label="Previous month">
            <i class="bi bi-chevron-left"></i>
          </button>
          <div class="dp-month-label">${MONTH_NAMES[viewMonth]} ${viewYear}</div>
          <button type="button" class="dp-nav" data-nav="next" ${!canGoNext ? "disabled" : ""} aria-label="Next month">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
        <div class="dp-weekdays">${WEEKDAYS.map((w) => `<div class="dp-weekday">${w}</div>`).join("")}</div>
        <div class="dp-grid">${cells}</div>
      </div>
    `;

    container.querySelector('[data-nav="prev"]')?.addEventListener("click", () => {
      viewMonth -= 1;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear -= 1;
      }
      render();
    });

    container.querySelector('[data-nav="next"]')?.addEventListener("click", () => {
      viewMonth += 1;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear += 1;
      }
      render();
    });

    container.querySelectorAll(".dp-day:not(.dp-disabled)").forEach((btn) => {
      btn.addEventListener("click", () => {
        selected = btn.dataset.date;
        onSelect(selected);
        render();
      });
    });
  }

  render();

  return {
    getSelected: () => selected,
    setSelected: (date) => {
      selected = date;
      render();
    },
  };
}
