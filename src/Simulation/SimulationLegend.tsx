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
        alignItems: 'center',
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
      <span
        style={{
          padding: '5px',
          borderRadius: '4px',
          background: journey.color,
          color: textColor(...rgbValuesForColor(journey.color)),
          fontWeight: '700',
        }}
      >
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

// https://stackoverflow.com/a/69057776
function rgbValuesForColor(color: string): [number, number, number] {
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  if (!context) {
    throw new Error(`No canvas context somehow`)
  }
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

function textColor(r: number, g: number, b: number): string {
  // http://www.w3.org/TR/AERT#color-contrast
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)
  const textColor = brightness > 125 ? 'black' : 'white'
  return textColor
}
