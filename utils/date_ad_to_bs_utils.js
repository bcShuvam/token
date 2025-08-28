const NepaliDate = require("nepali-date-converter").default;

/**
 * Convert AD date (yyyy-MM-dd) to BS date (yyyy-MM-dd)
 * @param {string} dateString - AD date in yyyy-MM-dd format
 * @returns {string|null} - BS date in yyyy-MM-dd format, or null if invalid
 */
function AdToBsDate(dateString) {
  if (!dateString) return null;

  // Parse "yyyy-MM-dd"
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;

  // JS Date (month is 0-based in JS Date.UTC, so subtract 1)
  const adDate = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(adDate.getTime())) return null;

  // Convert AD → BS
  const bsDate = NepaliDate.fromAD(adDate);

  // Format BS as yyyy-MM-dd
  return bsDate.format("YYYY-MM-DD");
}

module.exports = AdToBsDate;
