import NepaliDate from 'nepali-date-converter';
const nepaliDate = NepaliDate.default;

/**
 * Convert Nepali date to AD range
 * @param {number} year - Nepali year (e.g. 2082)
 * @param {number} monthIndex - Nepali month index (0 = Baisakh)
 * @param {number|null} date - Nepali date (1-based). If null, full month range
 * @returns {{from: string, to: string}} ISO date strings in UTC
 */
export function getNepaliDateRange(year, monthIndex, date = null) {
  let fromNepali, toNepali;

  if (!date) {
    // Full month range
    fromNepali = new nepaliDate(year, monthIndex, 1);

    // To = last day of month → create next month's first day, then subtract 1
    let nextMonth = monthIndex + 1;
    let nextYear = year;
    if (nextMonth > 11) { // Nepali months = 0-11
      nextMonth = 0;
      nextYear += 1;
    }
    toNepali = new nepaliDate(nextYear, nextMonth, 1);
    toNepali = new nepaliDate(toNepali.getYear(), toNepali.getMonth(), toNepali.getDate() - 1);
  } else {
    // Specific date
    fromNepali = new nepaliDate(year, monthIndex, date);
    toNepali = new nepaliDate(year, monthIndex, date);
  }

  // Convert to AD (UTC 00:00 for from, 23:59:59.999 for to)
  const fromAD = fromNepali.getAD();
  const toAD = toNepali.getAD();

  const fromDateUTC = new Date(Date.UTC(fromAD.year, fromAD.month, fromAD.date, 0, 0, 0, 0));
  const toDateUTC = new Date(Date.UTC(toAD.year, toAD.month, toAD.date, 23, 59, 59, 999));

  // Return ISO strings instead of Date objects
  return { from: fromDateUTC.toISOString(), to: toDateUTC.toISOString() };
}