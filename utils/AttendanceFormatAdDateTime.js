function formatAdDateTime(dateTime) {
  const [timePart, datePart] = dateTime.split(' ');
  const [hh, mm, ss] = timePart.split(':').map(Number);
  const [day, month, year] = datePart.split('/').map(Number);

  const adDate = new Date(year, month - 1, day, hh, mm, ss);

  const options = { month: 'long' }; // for full month name
  const monthName = adDate.toLocaleString('en-US', options);

  const formattedTime = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  const formattedDate = `${monthName}-${String(day).padStart(2, '0')}, ${adDate.getFullYear()}`;

  return `${formattedTime} ${formattedDate}`;
}

module.exports = formatAdDateTime;