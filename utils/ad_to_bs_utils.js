const NepaliDate = require('nepali-date-converter').default;

function AdToBsDatetime(date) {
  if (!date) {
    return { adNepal: null, bs: null }; // gracefully handle null
  }

  const nepalTime = new Date(date);
  if (isNaN(nepalTime.getTime())) {
    return { adNepal: null, bs: null }; // invalid date
  }

  // Convert AD → BS
  const bsDate = NepaliDate.fromAD(nepalTime);

  // Format BS date
  const bsFormattedDate = bsDate.format("YYYY-MM-DD");

  // Format time (12-hr with AM/PM)
  let hours = nepalTime.getHours();
  const minutes = nepalTime.getMinutes().toString().padStart(2, "0");
  const seconds = nepalTime.getSeconds().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const timePart = `${hours.toString().padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

  return {
    adNepal: nepalTime,
    bs: `${bsFormattedDate} ${timePart}`,
  };
}

module.exports = { AdToBsDatetime };
