const NepaliDate = require("nepali-date-converter").default;

/**
 * Convert UTC date into local timezone and format
 *
 * @param {Date} date - UTC date (from DB or GMT 0)
 * @param {"AD"|"BS"} [dateType="BS"] - calendar type (default BS)
 * @param {string} [timeZone="Asia/Kathmandu"] - default GMT +5:45
 * @returns {string} formatted date string
 *
 * Example output:
 *   "00:00 January-01, 2025"  (AD)
 *   "00:00 Baisakh-01, 2082"  (BS)
 */
function convertToLocal(date, dateType = "BS", timeZone = "Asia/Kathmandu") {
  if (!date) return "";

  // Shift date to local timezone using Intl
  const localStr = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const parts = Object.fromEntries(localStr.map((p) => [p.type, p.value]));

  const hh = parts.hour.padStart(2, "0");
  const mm = parts.minute.padStart(2, "0");

  if (dateType === "AD") {
    const yyyy = parts.year;
    const monthName = parts.month;
    const dd = parts.day;
    return `${hh}:${mm} ${monthName}-${dd}, ${yyyy}`;
  } else {
    const nep = new NepaliDate(date); // converts to BS
    const nepYear = nep.getYear();
    const nepMonth = nep.format("MMMM"); // BS month name
    const nepDay = String(nep.getDate()).padStart(2, "0");
    return `${hh}:${mm} ${nepMonth}-${nepDay}, ${nepYear}`;
  }
}

module.exports = convertToLocal;
