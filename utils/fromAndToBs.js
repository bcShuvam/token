const NepaliDate = require('nepali-date-converter').default;

function getMonthRange(fromStr, toStr) {
  const [fromYear, fromMonth] = fromStr.split('-').map(Number);
  const fromBS = new NepaliDate(fromYear, fromMonth - 1, 1);

  const [toYear, toMonth] = toStr.split('-').map(Number);
  const toBS = new NepaliDate(toYear, toMonth - 1, 1);
  toBS.setDate(toBS.daysInMonth()); // last day of month

  return { fromBS, toBS };
}

module.exports = getMonthRange;