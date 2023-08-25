import { useToken } from '@chakra-ui/system'
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Cycle } from '../state'
import { formatTimestamp } from '../utils'
import { Journey } from './SimulationVisualization'
import { JourneyDurationData } from './useJourneyDurations'

export function RechartsSimulationGraph({
  cycle,
  journeys,
  data,
  className,
}: {
  cycle: Cycle
  journeys: Journey[]
  data: JourneyDurationData
  className?: string
}) {
  const colors = useToken(
    'colors',
    journeys.map((journey) => `${journey.color}.500`),
  )
  return (
    <div className={className} css={{ direction: 'ltr' }}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={data}
          margin={{ top: 10, right: 0, left: 20, bottom: 30 }}
        >
          <CartesianGrid stroke='#ccc' />
          {journeys.map((journey, index) => (
            <Line
              key={journey.key}
              type='monotone'
              dataKey={journey.key}
              dot={false}
              stroke={colors[index]}
              animationDuration={0}
              strokeWidth={3}
            />
          ))}
          <Tooltip
            formatter={(value, key) => {
              const journey = journeys.find((j) => j.key === key)
              return [formatTimestamp(+value), journey?.title ?? '']
            }}
            labelFormatter={formatTimestamp}
          />
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
              value='(משך חציית הצומת* (בדקות'
              position='insideLeft'
              offset={-5}
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          {journeys.length === 0 && (
            <ReferenceDot
              x={cycle.duration / 2}
              y={35}
              label='הכניסו מסלול כדי לראות חישוב זמני חציה'
              r={0}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
