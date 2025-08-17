const NepaliDate = require('nepali-date-converter').default;

function getMonthRange(fromStr, toStr) {
  const fromYear = parseInt(fromStr.split('-')[0]);
  const fromMonth = parseInt(fromStr.split('-')[1]) - 1; // 0-based
  const fromBS = new NepaliDate(fromYear, fromMonth, 1);

  const toYear = parseInt(toStr.split('-')[0]);
  const toMonth = parseInt(toStr.split('-')[1]) - 1; // 0-based
  const toBS = new NepaliDate(toYear, toMonth + 1, 1); // jump to next month
  toBS.setDate(toBS.getDate() - 1); // last day of original month

  return { fromBS, toBS };
}

module.exports = getMonthRange;