import React from 'react'
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { Cycle } from '../reducer'
import { formatTimestamp } from '../utils'

export default function RechartsSimulationGraph({
  cycle,
  data,
  hasAsymmetricJourney,
}: {
  cycle: Cycle
  data: any
  hasAsymmetricJourney: boolean
}) {
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
