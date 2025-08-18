const NepaliDate = require("nepali-date-converter").default;

/**
 * Get date range in AD or BS
 * 
 * @param {Object} params
 * @param {"AD"|"BS"} params.dateType - AD or BS (default: BS)
 * @param {"monthly"|"custom"} params.range - monthly or custom
 * @param {number} params.year - Year in AD or BS
 * @param {number} params.monthIndex - Month index starting from 0
 * @param {string} [params.from] - "YYYY-MM-DD" if custom
 * @param {string} [params.to] - "YYYY-MM-DD" if custom
 * 
 * @returns {{fromAD: Date, toAD: Date, fromFormatted: string, toFormatted: string}}
 */
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
      // AD monthly
      fromAD = new Date(year, monthIndex, 1);
      fromAD.setHours(0, 0, 0, 0);

      toAD = new Date(year, monthIndex + 1, 0);
      toAD.setHours(23, 59, 59, 999);
    } else {
      // BS monthly
      const fromBS = new NepaliDate(year, monthIndex, 1); // first day of BS month
      const toBS = new NepaliDate(year, monthIndex + 1, 1); // first day of next month
      toBS.setDate(toBS.getDate() - 1); // last day of current month

      fromAD = fromBS.toJsDate();
      fromAD.setHours(0, 0, 0, 0);

      toAD = toBS.toJsDate();
      toAD.setHours(23, 59, 59, 999);
    }
  } else if (range === "custom") {
    if (dateType === "AD") {
      // AD custom
      fromAD = new Date(from);
      fromAD.setHours(0, 0, 0, 0);

      toAD = new Date(to);
      toAD.setHours(23, 59, 59, 999);
    } else {
      // BS custom
      const [fy, fm, fd] = from.split("-").map(Number);
      const [ty, tm, td] = to.split("-").map(Number);

      const fromBS = new NepaliDate(fy, fm - 1, fd);
      const toBS = new NepaliDate(ty, tm - 1, td);

      fromAD = fromBS.toJsDate();
      fromAD.setHours(0, 0, 0, 0);

      toAD = toBS.toJsDate();
      toAD.setHours(23, 59, 59, 999);
    }
  }

  return {
    fromAD,
    toAD,
    fromFormatted: formatOutputDate(fromAD, dateType),
    toFormatted: formatOutputDate(toAD, dateType),
  };
}

/**
 * Format AD or BS date into "hh:mm MMMM-dd, yyyy"
 * 
 * @param {Date} date 
 * @param {"AD"|"BS"} dateType 
 * @returns {string}
 */
function formatOutputDate(date, dateType) {
  if (!date) return "";

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  if (dateType === "AD") {
    const monthName = date.toLocaleString("en-US", { month: "long" });
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${hh}:${mm} ${monthName}-${dd}, ${yyyy}`;
  } else {
    const nep = new NepaliDate(date);
    const nepStr = nep.format("MMMM-DD, YYYY");
    return `${hh}:${mm} ${nepStr}`;
  }
}

module.exports = getDateRange;
