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

export function groupBy<T, K extends string | number>(
  items: T[],
  key: (item: T) => K,
): Map<K, T[]> {
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

export function tally<T extends string | number>(items: T[]): Map<T, number> {
  const counts = new Map<T, number>()
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  return counts
}

export function sortBy<T>(items: T[], key: (item: T) => number): T[] {
  const copy = [...items].sort((a, b) => key(a) - key(b))
  return copy
}

export function mod(n: number, m: number): number {
  const naiveMod = n % m
  if (naiveMod < 0) {
    return naiveMod + m
  } else {
    return naiveMod
  }
}

export function uniques<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

export function sum(array: number[]): number {
  return array.reduce((total, n) => total + n, 0)
}

export function sumBy<T>(array: T[], key: (item: T) => number): number {
  return array.reduce((total, item) => total + key(item), 0)
}

export function compact<T>(array: (T | null | undefined)[]): T[] {
  return array.filter((item) => item !== undefined && item !== null) as T[]
}

export function splice<T>(array: T[], betweenEveryTwoItems: T): T[] {
  return array.flatMap((item, index) =>
    index === 0 ? [item] : [betweenEveryTwoItems, item],
  )
}

export function pairs<T>(array: T[]): [T, T][] {
  if (array.length < 2) {
    return []
  }
  return range(array.length - 1).map((index) => [
    array[index],
    array[index + 1],
  ])
}

export function zeroPad(str: string, length: number): string {
  const missingCharacters = length - str.length
  if (missingCharacters > 0) {
    return `${new Array(missingCharacters).fill('0').join('')}${str}`
  } else {
    return str
  }
}
