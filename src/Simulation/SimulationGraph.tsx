import React, { useMemo } from 'react'
import { VictoryAxis, VictoryChart, VictoryLabel, VictoryLine } from 'victory'
import { CrosswalkId, Cycle, selectCanonicalWaitTimes } from '../reducer'
import { useSelector } from '../store'
import { formatTimestamp, mod } from '../utils'
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

  const canonicalDurations = useMemo(() => {
    return journeyDurationOverCycle(
      journeyCrosswalkIds,
      canonicalWaitTimes,
      walkTimes,
      cycle.duration,
    )
  }, [journeyCrosswalkIds, canonicalWaitTimes, cycle.duration])
  console.log({ canonicalDurations })
  const data = useMemo(
    () =>
      canonicalDurations.map((duration, timestamp) => ({
        duration: duration,
        timestamp: mod(timestamp - cycle.offset, cycle.duration),
      })),
    [canonicalDurations, cycle],
  )

  return (
    <div style={{ width: '700px', direction: 'ltr' }}>
      <VictoryChart padding={70}>
        <VictoryAxis
          tickFormat={formatTimestamp}
          label='זמן הגעה לצומת במחזור הרמזורים'
          axisLabelComponent={<VictoryLabel dy={10} />}
          style={{
            grid: { stroke: '#888', strokeWidth: 0.5, strokeDasharray: '' },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={formatTimestamp}
          label={'(הזמן שלוקח לעבור את הצומת (בדקות'}
          axisLabelComponent={<VictoryLabel dy={-20} />}
          style={{
            grid: { stroke: '#888', strokeWidth: 0.5, strokeDasharray: '' },
          }}
        />
        <VictoryLine
          data={data}
          x='timestamp'
          y='duration'
          domain={{ x: [0, cycle.duration], y: [0, 250] }}
        />
      </VictoryChart>
    </div>
  )
}
