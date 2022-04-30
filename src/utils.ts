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

export function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  for (const item of items) {
    const k = key(item)
    if (!groups.has(k)) {
      groups.set(k, [])
    }
    groups.get(k)!.push(item)
  }
  return groups
}

export function sortBy<T>(items: T[], key: (item: T) => number): T[] {
  const copy = [...items].sort((a, b) => key(a) - key(b))
  return copy
}
