import {
  Color,
  CrosswalkId,
  crosswalkKey,
  CrosswalkKey,
  Cycle,
  Transition,
} from '../reducer'
import { groupBy, mod, sortBy, sumBy, uniques } from '../utils'

export type TimedEventKey = `${CrosswalkKey}-${Color}`
export function timedEventKey(
  crosswalkId: CrosswalkId,
  color: Color,
): TimedEventKey {
  return `${crosswalkKey(crosswalkId)}-${color}`
}

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
        mod(transition.timestamp - cycle.recordingOffset, cycle.duration),
      ),
    ])
  return Object.fromEntries(timingEntries) as Record<TimedEventKey, number[]>
}

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
    recordingOffset: 0,
  })
  console.log({ timings })
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
