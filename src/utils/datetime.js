const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Adds minutes to a 24h "HH:MM" time string, wrapping within a single day. */
export function addMinutesToTime(time24, minutesToAdd) {
  const [h, m] = time24.split(":").map(Number);
  const total = (((h * 60 + m + minutesToAdd) % 1440) + 1440) % 1440;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

/** "2026-08-05" + "19:00" -> "5 Aug 2026, 7:00 PM" */
export function formatDisplayDateTime(isoDate, time24) {
  if (!isoDate || !time24) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const [h, m] = time24.split(":").map(Number);
  if (!year || !month || !day || Number.isNaN(h) || Number.isNaN(m)) return "";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${day} ${MONTHS[month - 1]} ${year}, ${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}
