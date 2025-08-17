const NepaliDate = require('nepali-date-converter').default;

/**
 * Convert AD datetime string to Nepali datetime string
 * @param {string} dateTime - in format "hh:mm:ss dd/MM/yyyy"
 * @returns {string} - Nepali datetime "hh:mm MMMM-DD, YYYY"
 */
function convertToNepaliDateTime(dateTime) {
  // Split into time + date
  const [timePart, datePart] = dateTime.split(' ');

  // Extract hh:mm:ss
  const [hh, mm, ss] = timePart.split(':').map(Number);

  // Extract dd/MM/yyyy
  const [day, month, year] = datePart.split('/').map(Number);

  // Build AD Date
  const adDate = new Date(year, month - 1, day, hh, mm, ss);

  // Convert to Nepali Date
  const nepDate = new NepaliDate(adDate);

  // Format Nepali date (e.g. "Ashadh-17, 2082")
  const formattedDate = nepDate.format('MMMM-DD, YYYY');

  // Format time (drop seconds, keep hh:mm)
  const formattedTime = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

  return `${formattedTime} ${formattedDate}`;
}

/**
 * Convert BS date range to AD ISO datetime range
 * @param {string} fromStr - Nepali date in format "YYYY-MM-DD"
 * @param {string} toStr   - Nepali date in format "YYYY-MM-DD"
 * @returns {{ from: string, to: string }}
 */
function convertBsRangeToAd(fromStr, toStr) {
  console.log(fromStr, toStr);
  // --- From ---
  const [fromYear, fromMonth, fromDay] = fromStr.split('-').map(Number);
  const fromBs = new NepaliDate(fromYear, fromMonth - 1, fromDay);
  const fromAd = fromBs.toJsDate();

  // set to 00:00:00
  fromAd.setHours(0);
  fromAd.setMinutes(0);
  fromAd.setSeconds(0);

  const fromIso = fromAd.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss

  // --- To ---
  const [toYear, toMonth, toDay] = toStr.split('-').map(Number);
  const toBs = new NepaliDate(toYear, toMonth - 1, toDay);
  const toAd = toBs.toJsDate();

  // set to 23:59:59
  toAd.setHours(23);
  toAd.setMinutes(59);
  toAd.setSeconds(59);

  const toIso = toAd.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss

  return { fromAD: fromIso, toAD: toIso };
}

// Example
// const { from, to } = convertBsRangeToAd("2082-04-01", "2082-04-30");
// console.log("From =", from);
// console.log("To   =", to);


module.exports = {convertToNepaliDateTime, convertBsRangeToAd };


// Example
// const dateTime = "09:02:38 01/07/2025";
// console.log(convertToNepaliDateTime(dateTime));
// 👉 "09:02 Ashadh-17, 2082"
