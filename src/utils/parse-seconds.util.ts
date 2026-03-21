export function parseSeconds(totalSeconds: number) {
  if (totalSeconds < 0 || !Number.isFinite(totalSeconds)) return '00:00:00'

  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0')

  return `${hh}:${mm}:${ss}`
}
