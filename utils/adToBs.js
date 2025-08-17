const NepaliDate = require('nepali-date-converter').default;

/**
 * Convert AD datetime string to Nepali datetime string
 * @param {string} dateTime - in format "hh:mm:ss dd/MM/yyyy"
 * @returns {string} - Nepali datetime "hh:mm MMMM-DD, YYYY"
 */
function convertToNepaliDateTime(dateTime) {
  const [timePart, datePart] = dateTime.split(' ');
  const [hh, mm, ss] = timePart.split(':').map(Number);
  const [day, month, year] = datePart.split('/').map(Number);

  const adDate = new Date(year, month - 1, day, hh, mm, ss);
  const nepDate = new NepaliDate(adDate);

  const formattedDate = nepDate.format('MMMM-DD, YYYY');
  const formattedTime = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

  return `${formattedTime} ${formattedDate}`;
}

/**
 * Convert BS date range to AD ISO datetime range
 * @param {string} fromStr - Nepali date in format "YYYY-MM-DD"
 * @param {string} toStr   - Nepali date in format "YYYY-MM-DD"
 * @returns {{ fromAD: string, toAD: string }}
 */
function convertBsRangeToAd(fromStr, toStr) {
  // --- From ---
  const [fromYear, fromMonth, fromDay] = fromStr.split('-').map(Number);
  const fromBs = new NepaliDate(fromYear, fromMonth - 1, fromDay);
  const fromAd = fromBs.toJsDate();
  fromAd.setHours(0, 0, 0);

  const fromIso = fromAd.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss

  // --- To ---
  const [toYear, toMonth, toDay] = toStr.split('-').map(Number);
  const toBs = new NepaliDate(toYear, toMonth - 1, toDay);
  const toAd = toBs.toJsDate();
  toAd.setHours(23, 59, 59);

  const toIso = toAd.toISOString().slice(0, 19);

  return { fromAD: fromIso, toAD: toIso };
}

module.exports = { convertToNepaliDateTime, convertBsRangeToAd };