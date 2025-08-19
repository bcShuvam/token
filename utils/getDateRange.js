// utils/getDateRange.js
const NepaliDate = require("nepali-date-converter").default;

// --- Helper: Get last day of BS month ---
const getLastDayOfBsMonth = (year, month) => {
  // Approximate days in each BS month (should be replaced with accurate calendar if needed)
  const bsMonthDays = [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30];
  return bsMonthDays[month - 1]; // month: 1-12
};

// --- Convert BS -> AD ---
const convertBSToAD = ({ year, month, day }) => {
  const nepaliDate = new NepaliDate(year, month - 1, day);
  return nepaliDate.toJsDate();
};

// --- Main function ---
function getDateRange({
  dateType = "BS",
  range = "monthly",
  year,
  monthIndex,
  from,
  to,
}) {
  let fromAD, toAD;

  if (range === "monthly") {
    if (dateType === "AD") {
      // Normal AD month
      const start = new Date(year, monthIndex, 1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(year, monthIndex + 1, 0); // last day of month
      end.setHours(23, 59, 59, 999);

      fromAD = start;
      toAD = end;
    } else {
      // BS Month
      const fromBS = { year: Number(year), month: Number(monthIndex) + 1, day: 1 };
      const lastDay = getLastDayOfBsMonth(Number(year), Number(monthIndex) + 1);
      const toBS = { year: Number(year), month: Number(monthIndex) + 1, day: lastDay };

      fromAD = convertBSToAD(fromBS);
      toAD = convertBSToAD(toBS);

      fromAD.setHours(0, 0, 0, 0);
      toAD.setHours(23, 59, 59, 999);
    }
  } else if (range === "custom") {
    if (!from || !to) {
      throw new Error("Both 'from' and 'to' are required for custom range");
    }

    if (dateType === "AD") {
      fromAD = new Date(from);
      fromAD.setHours(0, 0, 0, 0);

      toAD = new Date(to);
      toAD.setHours(23, 59, 59, 999);
    } else {
      const [fy, fm, fd] = from.split("-").map(Number);
      const [ty, tm, td] = to.split("-").map(Number);

      const fromBS = { year: fy, month: fm, day: fd };
      const toBS = { year: ty, month: tm, day: td };

      fromAD = convertBSToAD(fromBS);
      toAD = convertBSToAD(toBS);

      fromAD.setHours(0, 0, 0, 0);
      toAD.setHours(23, 59, 59, 999);
    }
  }

  return { fromAD, toAD };
}

module.exports = { getDateRange };
