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

module.exports = convertToNepaliDateTime;


// Example
// const dateTime = "09:02:38 01/07/2025";
// console.log(convertToNepaliDateTime(dateTime));
// 👉 "09:02 Ashadh-17, 2082"
