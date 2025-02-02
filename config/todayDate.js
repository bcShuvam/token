const date = new Date();
const offset = 5 * 60 + 45; // 5 hours 45 minutes in minutes
const adjustedDate = new Date(date.getTime() + offset * 60000);
const todayDate = adjustedDate.toISOString().split("T")[0];

module.exports = todayDate;
