// utils/convertToLocal.js
const NepaliDate = require("nepali-date-converter").default;

const BS_MONTHS = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Aswin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

function convertToLocal(date, dateType = "BS", timezone = "Asia/Kathmandu") {
  if (!date) return null;

  if (dateType === "AD") {
    // Format AD using Intl API (built-in)
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      month: "long",
      day: "2-digit",
      year: "numeric",
    });

    // e.g. "01/31/2025, 10:15 PM" → transform to "22:15 January-31, 2025"
    const parts = formatter.formatToParts(date);
    const hour = parts.find(p => p.type === "hour")?.value.padStart(2, "0");
    const minute = parts.find(p => p.type === "minute")?.value.padStart(2, "0");
    const day = parts.find(p => p.type === "day")?.value;
    const month = parts.find(p => p.type === "month")?.value;
    const year = parts.find(p => p.type === "year")?.value;

    return `${hour}:${minute} ${month}-${day}, ${year}`;
  }

  // Format BS
  const nepaliDate = new NepaliDate(date);
  const year = nepaliDate.getYear();
  const monthIndex = nepaliDate.getMonth();
  const month = BS_MONTHS[monthIndex];
  const day = nepaliDate.getDate();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes} ${month}-${day}, ${year}`;
}

module.exports = { convertToLocal };