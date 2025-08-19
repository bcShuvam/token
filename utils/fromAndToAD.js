// utils/fromAndToAD.js
const { startOfMonth, endOfMonth, startOfYear, endOfYear } = require("date-fns");

function fromAndToAD({ range, year, monthIndex }) {
  let fromAD, toAD;

  if (range === "monthly" && typeof year !== "undefined" && typeof monthIndex !== "undefined") {
    // MonthIndex is 0-based (0 = January, 6 = July)
    fromAD = startOfMonth(new Date(year, monthIndex, 1));
    toAD = endOfMonth(new Date(year, monthIndex, 1));
  } else if (range === "yearly" && typeof year !== "undefined") {
    fromAD = startOfYear(new Date(year, 0, 1));
    toAD = endOfYear(new Date(year, 0, 1));
  } else {
    // fallback: today
    const today = new Date();
    fromAD = startOfMonth(today);
    toAD = endOfMonth(today);
  }

  return { fromAD, toAD };
}

module.exports = { fromAndToAD };
