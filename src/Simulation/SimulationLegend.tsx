import React from 'react'
import { crosswalkKey, LegId, legIds, selectCrosswalkIds } from '../reducer'
import { useSelector } from '../store'
import { compact, formatTimestamp, mod, sum } from '../utils'
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
        gridTemplateColumns: 'auto auto auto auto auto auto 1fr',
        gap: '20px',
        alignItems: 'center',
        width: 'auto',
        marginTop: '40px',
      }}
    >
      <span />
      <span />
      <span style={{ gridColumn: 'span 4', textAlign: 'center' }}>
        משך חציית הצומת*
      </span>
      <span />
      <span style={{ gridColumn: 'span 2', textAlign: 'center' }}>מסלול</span>
      <span>מינימלי</span>
      <span>מקסימלי</span>
      <span>ממוצע</span>
      <span>ביום כיפור</span>
      <span />
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
        {journey.title}
      </span>
      <LittleJourneyDiagram journey={journey} />
      <span>{formatTimestamp(stats.min)}</span>
      <span>{formatTimestamp(stats.max)}</span>
      <span>{formatTimestamp(stats.mean)}</span>
      <span>{formatTimestamp(stats.kippur)}</span>
      <span></span>
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

const legWidth = 40
const legLength = 30
const roadColor = '#ccc'
const arrowColor = '#000'
const arrowWidth = 4
const arrowHeadDiagonalLength = 10

const viewBoxOffset = legWidth / 2 + legLength

const legRotation: Record<LegId, number> = {
  n: -90,
  e: 0,
  s: 90,
  w: 180,
}

function LittleJourneyDiagram({ journey }: { journey: Journey }) {
  const junction = useSelector((state) => state.junction)
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const secondToLastIndex =
    journey.crosswalkIndexes[mod(-2, journey.crosswalkIndexes.length)]
  const lastIndex =
    journey.crosswalkIndexes[mod(-1, journey.crosswalkIndexes.length)]
  const lastChirality = mod(lastIndex - secondToLastIndex, crosswalkIds.length)
  const isClockwise = lastChirality === 1 || lastChirality === 0
  const isCounterClockwise =
    lastChirality === crosswalkIds.length - 1 || lastChirality === 0

  return (
    <svg
      viewBox={`${-viewBoxOffset} ${-viewBoxOffset} ${2 * viewBoxOffset} ${
        2 * viewBoxOffset
      }`}
      style={{ width: '40px' }}
    >
      <rect
        x={-legWidth / 2}
        y={-legWidth / 2}
        width={legWidth}
        height={legWidth}
        fill={roadColor}
      />
      {legIds.map(
        (legId) =>
          junction[legId] && (
            <rect
              x={legWidth / 2}
              y={-legWidth / 2}
              width={legLength}
              height={legWidth}
              key={legId}
              fill={roadColor}
              transform={`rotate(${legRotation[legId]})`}
            />
          ),
      )}
      {journey.crosswalkIds.map((id, index) => {
        const x = legWidth / 2 + legLength / 2
        const y1 = id.part === 'second' ? 0 : -legWidth / 2 - legLength / 2
        const y2 = id.part === 'first' ? 0 : legWidth / 2 + legLength / 2

        return (
          <g
            key={crosswalkKey(id)}
            transform={`rotate(${legRotation[id.legId]})`}
          >
            <line
              x1={x}
              x2={x}
              y1={y1}
              y2={y2}
              stroke={arrowColor}
              strokeWidth={arrowWidth}
              strokeLinecap='round'
            />
            {index === journey.crosswalkIds.length - 1 && isClockwise && (
              <ArrowHead x={x} y1={y1} y2={y2} isOnTop={true} />
            )}
            {index === journey.crosswalkIds.length - 1 &&
              isCounterClockwise && (
                <ArrowHead x={x} y1={y1} y2={y2} isOnTop={false} />
              )}
          </g>
        )
      })}
    </svg>
  )
}

function ArrowHead({
  x,
  y1,
  y2,
  isOnTop,
}: {
  x: number
  y1: number
  y2: number
  isOnTop: boolean
}) {
  const y0 = isOnTop ? y2 : y1
  const yd = isOnTop
    ? y2 - arrowHeadDiagonalLength
    : y1 + arrowHeadDiagonalLength
  return (
    <>
      <line
        x1={x}
        y1={y0}
        x2={x + arrowHeadDiagonalLength}
        y2={yd}
        stroke={arrowColor}
        strokeWidth={arrowWidth}
        strokeLinecap='round'
      />
      <line
        x1={x}
        y1={y0}
        x2={x - arrowHeadDiagonalLength}
        y2={yd}
        stroke={arrowColor}
        strokeWidth={arrowWidth}
        strokeLinecap='round'
      />
    </>
  )
}
