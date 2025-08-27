import NepaliDate from 'nepali-date-converter';
const nepaliDate = NepaliDate.default;

export function AdToBsDatetime(date) {
  // Step 1: parse input as AD UTC
  const nepalTime = new Date(date);

  // Step 2: convert AD → BS (Nepal Time)
  const bsDate = nepaliDate.fromAD(nepalTime);

  // Step 3: format BS date (YYYY-MM-DD)
  const bsFormattedDate = bsDate.format("YYYY-MM-DD");

  // Step 4: format time into 12-hour with AM/PM
  let hours = nepalTime.getHours();
  const minutes = nepalTime.getMinutes().toString().padStart(2, "0");
  const seconds = nepalTime.getSeconds().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert 0 → 12 for midnight

  const timePart = `${hours.toString().padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

  // Step 5: combine BS date + time
  const bsDateTime = `${bsFormattedDate} ${timePart}`;

  return {
    adNepal: nepalTime,   // AD in Nepal Time (Date object)
    bs: bsDateTime,       // BS date + time in 12-hr format with AM/PM
  };
}
