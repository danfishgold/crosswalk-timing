import styled from '@emotion/styled'
import React from 'react'
import { crosswalkKey, LegId, legIds, selectCrosswalkIds } from '../reducer'
import { useSelector } from '../store'
import { compact, formatTimestamp, mod, sum } from '../utils'
import { Journey } from './SimulationVisualization'
import { JourneyDurationData } from './useJourneyDurations'

const Table = styled.table({
  padding: '10px 0 0',
  overflowX: 'scroll',
})
const Th = styled.th({
  padding: '5px 8px',
  background: '#eeeeee',
})

const Td = styled.td({
  padding: '5px',
  background: '#f4f4f4',
  textAlign: 'center',
})

const JourneyTitleLabel = styled.span({
  padding: '5px',
  borderRadius: '4px',
  fontWeight: '700',
})

export default function SimulationLegend({
  journeys,
  data,
  className,
}: {
  journeys: Journey[]
  data: JourneyDurationData
  className?: string
}) {
  return (
    <Table className={className}>
      <thead>
        <tr>
          <Td colSpan={2} css={{ background: 'white' }} />
          <Th colSpan={4} scope='colgroup'>
            משך חציית הצומת*
          </Th>
        </tr>
        <tr>
          <Th colSpan={2} scope='colgroup'>
            מסלול
          </Th>
          <Th scope='col'>מינימלי</Th>
          <Th scope='col'>מקסימלי</Th>
          <Th scope='col'>ממוצע</Th>
          <Th scope='col'>ביום כיפור</Th>
        </tr>
      </thead>
      <tbody>
        {journeys.map((journey) => (
          <JourneyRow key={journey.key} journey={journey} data={data} />
        ))}
      </tbody>
    </Table>
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
    <tr>
      <Td>
        <JourneyTitleLabel
          css={{
            background: journey.color,
            color: textColor(...rgbValuesForColor(journey.color)),
          }}
        >
          {journey.title}
        </JourneyTitleLabel>
      </Td>
      <Td>
        <LittleJourneyDiagram journey={journey} />
      </Td>
      <Td>{formatTimestamp(stats.min)}</Td>
      <Td>{formatTimestamp(stats.max)}</Td>
      <Td>{formatTimestamp(stats.mean)}</Td>
      <Td>{formatTimestamp(stats.kippur)}</Td>
    </tr>
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
const legLength = 40
const roadColor = '#ccc'
const arrowColor = '#000'
const arrowWidth = 6
const arrowHeadDiagonalLength = 12

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
      css={{ width: '40px' }}
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
