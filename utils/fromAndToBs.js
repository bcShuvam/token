const NepaliDate = require('nepali-date-converter').default;

function getMonthRange(fromStr, toStr) {
  const fromYear = parseInt(fromStr.split('-')[0]);
  const fromMonth = parseInt(fromStr.split('-')[1]);
  const fromBS = new NepaliDate(fromYear, fromMonth - 1, 1);

  const toYear = parseInt(toStr.split('-')[0]);
  const toMonth = parseInt(toStr.split('-')[1]);
  const toBS = new NepaliDate(toYear, toMonth, 1);
  toBS.setDate(toBS.getDate() - 1);

  return { fromBS, toBS };
}

module.exports = getMonthRange;