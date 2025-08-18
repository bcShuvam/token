const NepaliDate = require("nepali-date-converter").default;

/**
 * Convert AD datetime string (from DB/device) to Nepali date-time string
 * Input: "2025-07-01T09:02:38Z" or "2025-07-01 09:02:38"
 * Output: "09:02 July-01, 2082"
 */
function convertToNepaliDateTime(dateTime) {
  if (!dateTime) return "";

  const jsDate = new Date(dateTime);
  if (isNaN(jsDate)) return "";

  // Extract AD time (hh:mm)
  const hours = String(jsDate.getHours()).padStart(2, "0");
  const minutes = String(jsDate.getMinutes()).padStart(2, "0");

  // Convert to BS
  const nepaliDate = new NepaliDate(jsDate);
  const formatted = nepaliDate.format("MMMM-DD, YYYY");

  return `${hours}:${minutes} ${formatted}`;
}

/**
 * Convert AD datetime string to formatted AD date-time string
 * Input: "2025-07-01T09:02:38Z"
 * Output: "09:02 July-01, 2025"
 */
function formatAdDateTime(dateTime) {
  if (!dateTime) return "";

  const jsDate = new Date(dateTime);
  if (isNaN(jsDate)) return "";

  const hours = String(jsDate.getHours()).padStart(2, "0");
  const minutes = String(jsDate.getMinutes()).padStart(2, "0");

  const options = { month: "long", day: "2-digit", year: "numeric" };
  const formatted = jsDate.toLocaleDateString("en-US", options);

  return `${hours}:${minutes} ${formatted.replace(",", "")}`;
}

module.exports = { convertToNepaliDateTime, formatAdDateTime };
