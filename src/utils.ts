export function formatTimestamp(timestamp: number): string {
  const minutes = Math.floor(timestamp / 60)
  const seconds = Math.round(timestamp % 60)
  const paddedSeconds = seconds.toString().length < 2 ? '0' + seconds : seconds
  return `${minutes}:${paddedSeconds}`
}

export function range(n: number): number[] {
  return new Array(n).fill(0).map((_, index) => index)
}

export function setArrayItem<T>(array: T[], index: number, value: T): T[] {
  return [...array.slice(0, index), value, ...array.slice(index + 1)]
}
