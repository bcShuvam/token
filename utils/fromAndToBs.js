const NepaliDate = require('nepali-date-converter').default;

function getMonthRange(fromStr, toStr) {
  const fromYear = parseInt(fromStr.split('-')[0]);
  const fromMonth = parseInt(fromStr.split('-')[1]);
  const from = new NepaliDate(fromYear, fromMonth - 1, 1);

  const toYear = parseInt(toStr.split('-')[0]);
  const toMonth = parseInt(toStr.split('-')[1]);
  const to = new NepaliDate(toYear, toMonth, 1);
  to.setDate(to.getDate() - 1);

  return { from, to };
}

module.exports = getMonthRange;