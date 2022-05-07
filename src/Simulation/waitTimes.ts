import { Segment } from '../Cycle/timedEvents'
import { CrosswalkId, crosswalkKey, CrosswalkKey } from '../reducer'
import { mod, range } from '../utils'

export function canonicalWaitTimes(
  canonicalSegments: Segment[],
  cycleDuration: number,
): number[] {
  const waitTimes = new Array(cycleDuration).fill(0)
  for (const segment of canonicalSegments) {
    if (segment.color === 'green') {
      continue
    }

    range(segment.duration).forEach((segmentOffset) => {
      const index = mod(segment.offset + segmentOffset, cycleDuration)
      const waitTime = segment.duration - segmentOffset
      waitTimes[index] = waitTime
    })
  }
  return waitTimes
}

export function journeyDurationOverCycle(
  journey: CrosswalkId[],
  waitTimes: Map<CrosswalkKey, number[]>,
  walkTimes: Partial<Record<CrosswalkKey, number>>,
  cycleDuration: number,
): number[] | null {
  let durations = new Array(cycleDuration).fill(0)

  try {
    for (const crosswalkId of journey) {
      const key = crosswalkKey(crosswalkId)
      durations = durations.map((duration, offset) => {
        const offsetBeforeCrossing = mod(offset + duration, cycleDuration)
        const waitTime = waitTimes.get(key)?.[offsetBeforeCrossing]
        const walkTime = walkTimes[key]
        if (waitTime === undefined || walkTime === undefined) {
          throw new Error(`Missing data for journey duration at ${offset}`)
        }
        return duration + waitTime + walkTime
      })
    }
    return durations
  } catch {
    return null
  }
}
