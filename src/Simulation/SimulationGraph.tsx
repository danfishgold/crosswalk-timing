import React, { useMemo } from 'react'
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CrosswalkId,
  crosswalkKey,
  Cycle,
  selectCanonicalWaitTimes,
  selectCrosswalkIds,
} from '../reducer'
import { useSelector } from '../store'
import { formatTimestamp, mod, range } from '../utils'
import { journeyDurationOverCycle } from './waitTimes'

export default function RechartsSimulationGraph({ cycle }: { cycle: Cycle }) {
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

  return (
    <div style={{ direction: 'ltr' }}>
      <ResponsiveContainer width='100%' height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 20, bottom: 30 }}
        >
          <CartesianGrid stroke='#ccc' />
          <Line
            type='monotone'
            dataKey='journeyDuration'
            dot={false}
            animationDuration={0}
            strokeWidth={3}
          />
          {hasAsymmetricJourney && (
            <Line
              type='monotone'
              dataKey='reverseJourneyDuration'
              dot={false}
              animationDuration={0}
              strokeWidth={3}
            />
          )}
          <XAxis
            dataKey='timestamp'
            type='number'
            tickFormatter={formatTimestamp}
            domain={['dataMin', 'dataMax']}
            tickCount={Math.ceil(cycle.duration / 15) + 1}
          >
            <Label
              value='(זמן התחלה במחזור הרמזור (שרירותי'
              position='insideBottom'
              offset={-20}
              style={{ textAnchor: 'middle' }}
            />
          </XAxis>
          <YAxis
            type='number'
            tickFormatter={formatTimestamp}
            domain={[
              0,
              (dataMax: number) => Math.ceil(Math.max(dataMax, 60) / 60) * 60,
            ]}
          >
            <Label
              angle={-90}
              value='(משך חציית הצומת (בדקות'
              position='insideLeft'
              offset={-5}
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function isAsymmetric(journey: CrosswalkId[]): boolean {
  const keys = journey.map(crosswalkKey).join(',')
  const reverseKeys = [...journey].reverse().map(crosswalkKey).join(',')
  return keys !== reverseKeys
}
