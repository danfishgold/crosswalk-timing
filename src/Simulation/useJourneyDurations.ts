import { useMemo } from 'react'
import {
  CrosswalkId,
  crosswalkKey,
  Cycle,
  selectCanonicalWaitTimes,
  selectCrosswalkIds,
} from '../reducer'
import { useSelector } from '../store'
import { mod, range } from '../utils'
import { journeyDurationOverCycle } from './waitTimes'

export default function useJourneyDurations(cycle: Cycle) {
  const canonicalWaitTimes = useSelector(selectCanonicalWaitTimes)
  const walkTimes = useSelector((state) => state.walkTimes)
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const journeyIndexes = useSelector((state) => state.journeyIndexes)

  const journeyCrosswalkIds = useMemo(() => {
    if (
      Math.min(...journeyIndexes) < 0 ||
      Math.max(...journeyIndexes) >= crosswalkIds.length
    ) {
      return []
    } else {
      return journeyIndexes.map((index) => crosswalkIds[index])
    }
  }, [crosswalkIds, journeyIndexes])

  const hasAsymmetricJourney = isAsymmetric(journeyCrosswalkIds)

  const [canonicalDurations, canonicalReverseDurations] = useMemo(() => {
    return [
      journeyDurationOverCycle(
        journeyCrosswalkIds,
        canonicalWaitTimes,
        walkTimes,
        cycle.duration,
      ),
      journeyDurationOverCycle(
        [...journeyCrosswalkIds].reverse(),
        canonicalWaitTimes,
        walkTimes,
        cycle.duration,
      ),
    ]
  }, [journeyCrosswalkIds, canonicalWaitTimes, cycle.duration])

  const data = useMemo(
    () =>
      range(cycle.duration + 1).map((timestamp) => ({
        timestamp,
        journeyDuration:
          canonicalDurations?.[mod(timestamp + cycle.offset, cycle.duration)],
        reverseJourneyDuration:
          canonicalReverseDurations?.[
            mod(timestamp + cycle.offset, cycle.duration)
          ],
      })),
    [canonicalDurations, canonicalReverseDurations, cycle],
  )

  return { data, hasAsymmetricJourney }
}

function isAsymmetric(journey: CrosswalkId[]): boolean {
  const keys = journey.map(crosswalkKey).join(',')
  const reverseKeys = [...journey].reverse().map(crosswalkKey).join(',')
  return keys !== reverseKeys
}
