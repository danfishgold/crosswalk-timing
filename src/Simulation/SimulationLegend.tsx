import { crosswalkKey } from '../reducer'
import { useSelector } from '../store'
import { compact, formatTimestamp, sum } from '../utils'
import { Journey } from './SimulationVisualization'
import { JourneyDurationData } from './useJourneyDurations'

export default function SimulationLegend({
  journeys,
  data,
}: {
  journeys: Journey[]
  data: JourneyDurationData
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto auto auto',
        gap: '20px',
      }}
    >
      <span />
      <span style={{ gridColumn: 'span 4', textAlign: 'center' }}>
        משך חציית הצומת
      </span>
      <span>מסלול</span>
      <span>מינימלי</span>
      <span>מקסימלי</span>
      <span>ממוצע</span>
      <span>ביום כיפור</span>
      {journeys.map((journey) => (
        <JourneyRow key={journey.key} journey={journey} data={data} />
      ))}
    </div>
  )
}

function JourneyRow({
  journey,
  data,
}: {
  journey: Journey
  data: JourneyDurationData
}) {
  const stats = useStatistics(journey, data)
  return (
    <>
      <span>
        {journey.crosswalkIndexes.map((index) => index + 1).join(' → ')}
      </span>
      <span>{formatTimestamp(stats.min)}</span>
      <span>{formatTimestamp(stats.max)}</span>
      <span>{formatTimestamp(stats.mean)}</span>
      <span>{formatTimestamp(stats.kippur)}</span>
    </>
  )
}

function useStatistics(
  journey: Journey,
  data: JourneyDurationData,
): { min: number; max: number; mean: number; kippur: number } {
  const walkTimes = useSelector((state) => state.walkTimes)

  const durations = compact(data.map((datum) => datum[journey.key]))
  const min = Math.min(...durations)
  const max = Math.max(...durations)
  const mean = sum(durations) / durations.length
  const kippur = sum(
    journey.crosswalkIds.map((id) => walkTimes[crosswalkKey(id)] ?? Infinity),
  )
  return { min, max, mean, kippur }
}
