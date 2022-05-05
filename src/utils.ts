import { Color, Highlight } from './reducer'

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

export const colorColors: Record<Color, string> = {
  green: '#28e23f',
  red: '#e91c32',
}
export const highlightColors: Record<Highlight, string> = {
  highlight: 'lightsalmon',
  ...colorColors,
}
