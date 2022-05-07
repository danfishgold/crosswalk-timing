import {
  Color,
  CrosswalkId,
  crosswalkKey,
  CrosswalkKey,
  Cycle,
  Transition,
} from '../reducer'
import { groupBy, mod, pairs, sortBy, sumBy, uniques } from '../utils'

// Key function

export type TimedEventKey = `${CrosswalkKey}-${Color}`
export function timedEventKey(
  crosswalkId: CrosswalkId,
  color: Color,
): TimedEventKey {
  return `${crosswalkKey(crosswalkId)}-${color}`
}

// Event timestamp suggestions

export function timingSuggestions(
  transitions: Record<string, Transition>,
  cycle: Cycle,
): Record<TimedEventKey, number[]> {
  const groupedTransitions = groupBy(Object.values(transitions), (transition) =>
    timedEventKey(transition.crosswalkId, transition.toColor),
  )
  const groupedTransitionEntries = Array.from(groupedTransitions.entries())
  const timingEntries: [TimedEventKey, number[]][] =
    groupedTransitionEntries.map(([key, transitions]) => [
      key,
      transitions.map((transition) =>
        mod(transition.timestamp, cycle.duration),
      ),
    ])
  return Object.fromEntries(timingEntries) as Record<TimedEventKey, number[]>
}

// Cycle duration suggestions

export function cycleDurationSuggestions(
  transitions: Record<string, Transition>,
): { duration: number; conflictCount: number }[] {
  const groupedTransitions = groupBy(Object.values(transitions), (transition) =>
    timedEventKey(transition.crosswalkId, transition.toColor),
  )
  const groupedTransitionValues = Array.from(groupedTransitions.values())
  const allPossibleCycleDurations = uniques(
    groupedTransitionValues.flatMap(timestampDiffs),
  )

  const unsortedDurationSuggestions = allPossibleCycleDurations.map(
    (duration) => ({
      duration,
      conflictCount: conflictCount(transitions, duration),
    }),
  )
  return sortBy(
    unsortedDurationSuggestions,
    (suggestion) => suggestion.conflictCount,
  )
}

function conflictCount(
  transitions: Record<string, Transition>,
  duration: number,
): number {
  const timings = timingSuggestions(transitions, {
    duration,
    offset: 0,
  })
  return sumBy(
    Object.values(timings),
    (timestamps) => uniques(timestamps).length - 1,
  )
}

function timestampDiffs(transitions: Transition[]): number[] {
  const timestamps = transitions.map((transition) => transition.timestamp)
  timestamps.sort((a, b) => a - b)
  return timestamps
    .slice(0, -1)
    .map((timestamp, index) => timestamps[index + 1] - timestamp)
}

// Cycle segments

export type Segment = { color: Color; offset: number; duration: number }

export function canonicalTrackSegments(
  reds: number[],
  greens: number[],
  cycleDuration: number,
): Segment[] | null {
  const sortedEvents: { timestamp: number; color: Color }[] = sortBy(
    [
      ...reds.map((timestamp) => ({ timestamp, color: 'red' as const })),
      ...greens.map((timestamp) => ({ timestamp, color: 'green' as const })),
    ].map((event) => ({
      ...event,
      timestamp: mod(event.timestamp, cycleDuration),
    })),
    (event) => event.timestamp,
  )
  const eventCount = sortedEvents.length
  if (eventCount < 2) {
    return null
  }

  const firstEventAgain = {
    timestamp: sortedEvents[0].timestamp + cycleDuration,
    color: sortedEvents[0].color,
  }
  const eventPairs = pairs([...sortedEvents, firstEventAgain])

  if (
    eventPairs.length === 0 ||
    eventPairs.some(([event1, event2]) => event1.color === event2.color)
  ) {
    return null
  }

  return eventPairs.map(([event1, event2]) => ({
    color: event1.color,
    offset: event1.timestamp,
    duration: event2.timestamp - event1.timestamp,
  }))
}

export function cutSegmentsToFit(segments: Segment[], cycle: Cycle): Segment[] {
  const moddedSegments = segments.flatMap((segment) => {
    const startTime = mod(segment.offset - cycle.offset, cycle.duration)
    const endTime = mod(startTime + segment.duration, cycle.duration)
    if (endTime < startTime && endTime !== 0) {
      return [
        {
          offset: startTime,
          duration: cycle.duration - startTime,
          color: segment.color,
        },
        { offset: 0, duration: endTime, color: segment.color },
      ]
    } else {
      return [
        { offset: startTime, duration: segment.duration, color: segment.color },
      ]
    }
  })

  return moddedSegments
}
