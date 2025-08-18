const NepaliDate = require("nepali-date-converter").default;

// Convert BS range (YYYY-MM-DD) to AD ISO strings
function convertBsRangeToAd(fromBS, toBS) {
  const [fromYear, fromMonth, fromDay] = fromBS.split("-").map(Number);
  const [toYear, toMonth, toDay] = toBS.split("-").map(Number);

  const fromNepali = new NepaliDate(fromYear, fromMonth - 1, fromDay);
  const toNepali = new NepaliDate(toYear, toMonth - 1, toDay);

  const fromAD = fromNepali.toJsDate();
  const toAD = toNepali.toJsDate();

  fromAD.setHours(0, 0, 0, 0);
  toAD.setHours(23, 59, 59, 999);

  return { fromAD: fromAD.toISOString(), toAD: toAD.toISOString() };
}

// Get first and last day of a BS month
function getMonthRange(fromStr, toStr) {
  const [fromYear, fromMonth] = fromStr.split("-").map(Number);
  const fromBS = new NepaliDate(fromYear, fromMonth - 1, 1);

  const [toYear, toMonth] = toStr.split("-").map(Number);
  const toBS = new NepaliDate(toYear, toMonth - 1, 1);
  toBS.setDate(toBS.daysInMonth()); // ✅ last day of month

  return { fromBS, toBS };
}

module.exports = { convertBsRangeToAd, getMonthRange };
