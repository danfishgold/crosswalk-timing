import React, { useMemo } from 'react'
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
  VictoryLine,
} from 'victory'
import {
  CrosswalkId,
  crosswalkKey,
  Cycle,
  selectCanonicalWaitTimes,
  selectCrosswalkIds,
} from '../reducer'
import { useSelector } from '../store'
import { compact, formatTimestamp, mod } from '../utils'
import { journeyDurationOverCycle } from './waitTimes'

export default function SimulationGraph({
  journeyCrosswalkIndexes,
  cycle,
}: {
  journeyCrosswalkIndexes: number[]
  cycle: Cycle
}) {
  const canonicalWaitTimes = useSelector(selectCanonicalWaitTimes)
  const walkTimes = useSelector((state) => state.walkTimes)
  const crosswalkIds = useSelector(selectCrosswalkIds)

  const journeyCrosswalkIds = useMemo(() => {
    if (
      Math.min(...journeyCrosswalkIndexes) < 0 ||
      Math.max(...journeyCrosswalkIndexes) >= crosswalkIds.length
    ) {
      return []
    } else {
      return journeyCrosswalkIndexes.map((index) => crosswalkIds[index])
    }
  }, [crosswalkIds, journeyCrosswalkIndexes])

  const hasJourney = journeyCrosswalkIds.length > 0
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
  const [data, reverseData] = useMemo(
    () => [
      canonicalDurations?.map((duration, timestamp) => ({
        duration: duration,
        timestamp: mod(timestamp - cycle.offset, cycle.duration),
      })),
      canonicalReverseDurations?.map((duration, timestamp) => ({
        duration: duration,
        timestamp: mod(timestamp - cycle.offset, cycle.duration),
      })),
    ],
    [canonicalDurations, cycle],
  )

  const legendData = useMemo(
    () =>
      compact([
        {
          name: journeyCrosswalkIndexes.map((index) => index + 1).join('→'),
          symbol: { fill: 'indigo' },
        },
        hasAsymmetricJourney && {
          name: [...journeyCrosswalkIndexes]
            .reverse()
            .map((index) => index + 1)
            .join('→'),
          symbol: { fill: 'tomato' },
        },
      ]),
    [journeyCrosswalkIds],
  )

  if (!data || !reverseData) {
    return <p>יש בעיה איפשהו</p>
  }

  return (
    <div style={{ width: '700px', direction: 'ltr' }}>
      <VictoryChart padding={70}>
        <VictoryAxis
          tickFormat={formatTimestamp}
          tickCount={Math.ceil(cycle.duration / 15)}
          label='(זמן הגעה לצומת במחזור הרמזורים (שרירותי'
          axisLabelComponent={<VictoryLabel dy={10} />}
          style={{
            grid: { stroke: '#888', strokeWidth: 0.5, strokeDasharray: '' },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={formatTimestamp}
          tickValues={[0, 30, 60, 90, 120, 150, 180, 210, 240]}
          label={'(הזמן שלוקח לעבור את הצומת (בדקות'}
          axisLabelComponent={<VictoryLabel dy={-20} />}
          style={{
            grid: { stroke: '#888', strokeWidth: 0.5, strokeDasharray: '' },
          }}
        />
        {hasJourney && (
          <VictoryLine
            data={data}
            x='timestamp'
            y='duration'
            style={{ data: { stroke: 'indigo' } }}
          />
        )}
        {hasJourney && hasAsymmetricJourney && (
          <VictoryLine
            data={reverseData}
            x='timestamp'
            y='duration'
            style={{ data: { stroke: 'tomato' } }}
          />
        )}
        {hasJourney && (
          <VictoryLegend
            x={69}
            y={25}
            orientation='horizontal'
            gutter={40}
            style={{ border: { stroke: 'black' }, title: { fontSize: 20 } }}
            data={legendData}
          />
        )}
      </VictoryChart>
    </div>
  )
}

function isAsymmetric(journey: CrosswalkId[]): boolean {
  const keys = journey.map(crosswalkKey).join(',')
  const reverseKeys = [...journey].reverse().map(crosswalkKey).join(',')
  return keys !== reverseKeys
}
