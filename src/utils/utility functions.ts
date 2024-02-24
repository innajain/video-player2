export function getTimeFormatted(time: number) {
  let hours = (time / 3600).toFixed(0);
  let minutes = ((time % 3600) / 60).toFixed(0);
  let seconds = (time % 60).toFixed(0);
  if (hours.length === 1) hours = "0" + hours;
  if (minutes.length === 1) minutes = "0" + minutes;
  if (seconds.length === 1) seconds = "0" + seconds;
  return `${hours}:${minutes}:${seconds}`;
}
