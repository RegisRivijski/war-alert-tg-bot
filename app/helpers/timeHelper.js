const formatTime = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString('uk-UA', {
    timeZone: 'Europe/Kiev',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

module.exports = {
  formatTime,
};
