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

export default function SimulationGraph({ cycle }: { cycle: Cycle }) {
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
          name: journeyIndexes.map((index) => index + 1).join(' → '),
          symbol: { fill: 'indigo' },
        },
        hasAsymmetricJourney
          ? {
              name: [...journeyIndexes]
                .reverse()
                .map((index) => index + 1)
                .join(' → '),
              symbol: { fill: 'tomato' },
            }
          : null,
      ]),
    [journeyCrosswalkIds],
  )

  if (!data || !reverseData) {
    return <p>יש בעיה איפשהו</p>
  }

  const labelStyle = {
    fontFamily: 'inherit',
    fontSize: '12px',
  }

  return (
    <div style={{ width: '700px', direction: 'ltr' }}>
      <VictoryChart padding={{ top: 70, left: 70, right: 70, bottom: 30 }}>
        <VictoryAxis
          tickFormat={formatTimestamp}
          tickCount={Math.ceil(cycle.duration / 15)}
          label='(זמן הגעה לצומת במחזור הרמזורים (שרירותי'
          axisLabelComponent={<VictoryLabel dy={10} />}
          style={{
            grid: { stroke: '#888', strokeWidth: 0.5, strokeDasharray: '' },
            axisLabel: labelStyle,
            tickLabels: labelStyle,
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
            axisLabel: labelStyle,
            tickLabels: labelStyle,
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
            style={{
              border: { stroke: 'black' },
              labels: { fontFamily: 'inherit' },
            }}
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
