import { useMemo } from 'react'
import { selectCanonicalWaitTimes } from '../reducer'
import { Cycle } from '../state'
import { useSelector } from '../store'
import { mod, range } from '../utils'
import { Journey } from './SimulationVisualization'
import { journeyDurationOverCycle } from './waitTimes'

export type JourneyDurationData = {
  timestamp: number
  [journey: string]: number | undefined
}[]

export default function useJourneyDurations(
  cycle: Cycle,
  journeys: Journey[],
): JourneyDurationData {
  const canonicalWaitTimes = useSelector(selectCanonicalWaitTimes)
  const walkTimes = useSelector((state) => state.walkTimes)

  const canonicalDurations: Record<string, number[] | null> = useMemo(
    () =>
      Object.fromEntries(
        journeys.map((journey) => [
          journey.key,
          journeyDurationOverCycle(
            journey.crosswalkIds,
            canonicalWaitTimes,
            walkTimes,
            cycle.duration,
          ),
        ]),
      ),
    [journeys, canonicalWaitTimes, cycle.duration],
  )

  const data: JourneyDurationData = useMemo(
    () =>
      range(cycle.duration + 1).map((timestamp) => {
        const dataPoints: Record<string, number | undefined> =
          Object.fromEntries(
            journeys.map((journey) => [
              journey.key,
              canonicalDurations[journey.key]?.[
                mod(timestamp + cycle.offset, cycle.duration)
              ],
            ]),
          )
        return {
          timestamp,
          ...dataPoints,
        }
      }),
    [canonicalDurations, cycle.duration, cycle.offset],
  )

  return data
}
