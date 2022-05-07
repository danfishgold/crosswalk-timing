import { useMemo } from 'react'
import { CrosswalkId, Cycle, selectCanonicalWaitTimes } from '../reducer'
import { useSelector } from '../store'
import { journeyDurationOverCycle } from './waitTimes'

export default function SimulationGraph({
  journeyCrosswalkIds,
  cycle,
}: {
  journeyCrosswalkIds: CrosswalkId[]
  cycle: Cycle
}) {
  const canonicalWaitTimes = useSelector(selectCanonicalWaitTimes)
  const walkTimes = useSelector((state) => state.walkTimes)

  const durations = useMemo(() => {
    return journeyDurationOverCycle(
      journeyCrosswalkIds,
      canonicalWaitTimes,
      walkTimes,
      cycle.duration,
    )
  }, [journeyCrosswalkIds, canonicalWaitTimes, cycle?.duration])

  return <div></div>
}
