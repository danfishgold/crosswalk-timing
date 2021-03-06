import { useToken } from '@chakra-ui/system'
import React, { MouseEventHandler, useMemo } from 'react'
import {
  CrosswalkId,
  crosswalkKey,
  Highlight,
  Leg,
  LegId,
  legIds,
  selectCrosswalkHighlightColors,
  selectCrosswalkIds,
} from '../reducer'
import { useSelector } from '../store'
import { range } from '../utils'

// Sizes
const legWidth = 30
const legLength = 30
const crosswalkLength = 15
const crosswalkSegmentsInEachDirection = 3
const islandWidthInSegments = 2

// Derived sizes
const crosswalkSegmentCount =
  crosswalkSegmentsInEachDirection * 2 + islandWidthInSegments
const crosswalkSegmentLength = legWidth / (crosswalkSegmentCount * 2 + 1)
const islandY =
  crosswalkSegmentLength * (crosswalkSegmentsInEachDirection * 2 + 1)
const islandHeight = crosswalkSegmentLength * (islandWidthInSegments * 2 - 1)
const circleRadius = crosswalkSegmentLength * 1.5
const crosswalkOffset = islandHeight
const viewBoxOffset = legWidth / 2 + legLength

const legRotation: Record<LegId, number> = {
  n: -90,
  e: 0,
  s: 90,
  w: 180,
}

export function JunctionSvg({
  inEditMode,
  onLegClick,
}: {
  inEditMode: boolean
  onLegClick: (legId: LegId) => void
}) {
  const junction = useSelector((state) => state.junction)
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const highlights = useSelector(selectCrosswalkHighlightColors)

  return (
    <svg
      css={{
        height: '250px',
        width: '250px',
      }}
      viewBox={`${-viewBoxOffset} ${-viewBoxOffset} ${viewBoxOffset * 2} ${
        viewBoxOffset * 2
      }`}
    >
      <rect
        x={-viewBoxOffset}
        y={-viewBoxOffset}
        width={viewBoxOffset * 2}
        height={viewBoxOffset * 2}
        fill='#f4f4f4'
      />
      <rect
        className='road'
        x={-legWidth / 2}
        y={-legWidth / 2}
        width={legWidth}
        height={legWidth}
      />
      {legIds.map((legId) => (
        <g
          key={legId}
          transform={`rotate(${legRotation[legId]}) translate(${legWidth / 2},${
            -legWidth / 2
          })`}
        >
          {(inEditMode || junction[legId]) && (
            <JunctionLegGroup
              leg={junction[legId]}
              onClick={inEditMode ? () => onLegClick(legId) : undefined}
              ariaLabel={junction[legId] ? '?????????? ????????' : '?????????? ????????'}
            />
          )}
        </g>
      ))}
      <g>
        {crosswalkIds.map((crosswalkId, index) => (
          <CrosswalkIndicatorGroup
            key={crosswalkKey(crosswalkId)}
            crosswalkId={crosswalkId}
            highlight={highlights[crosswalkKey(crosswalkId)]}
            index={index}
          />
        ))}
      </g>
    </svg>
  )
}

function CrosswalkIndicatorGroup({
  crosswalkId,
  highlight,
  index,
}: {
  crosswalkId: CrosswalkId
  highlight: Highlight | null
  index: number
}) {
  const x = legWidth / 2 + crosswalkOffset
  const [y1, y2] = useMemo(() => {
    if (!crosswalkId.part) {
      const y1 = -legWidth / 2 + crosswalkSegmentLength
      const y2 = legWidth / 2 - crosswalkSegmentLength
      return [y1, y2]
    } else if (crosswalkId.part === 'first') {
      const y1 = -legWidth / 2 + crosswalkSegmentLength
      const y2 =
        -legWidth / 2 +
        crosswalkSegmentLength * (crosswalkSegmentsInEachDirection * 2)
      return [y1, y2]
    } else {
      const y1 =
        legWidth / 2 -
        crosswalkSegmentLength * (crosswalkSegmentsInEachDirection * 2)
      const y2 = legWidth / 2 - crosswalkSegmentLength
      return [y1, y2]
    }
  }, [crosswalkId.part])

  const color = useToken('colors', highlight ? 'yellow.300' : 'white')
  return (
    <g transform={`rotate(${legRotation[crosswalkId.legId]})`}>
      <line
        x1={x}
        x2={x}
        y1={y1}
        y2={y2}
        stroke={color}
        strokeWidth={crosswalkSegmentLength}
      />
      <circle cx={x} cy={(y1 + y2) / 2} r={circleRadius} fill={color} />
      <text
        x={0}
        y={0}
        fontSize={crosswalkSegmentLength * 2.5}
        fill='black'
        textAnchor='middle'
        alignmentBaseline='middle'
        transform={`translate(${x}, ${(y1 + y2) / 2}) rotate(${-legRotation[
          crosswalkId.legId
        ]})`}
      >
        {index + 1}
      </text>
    </g>
  )
}

function JunctionLegGroup({
  leg,
  onClick,
  ariaLabel,
}: {
  leg: Leg | null
  onClick?: MouseEventHandler<SVGElement>
  ariaLabel?: string
}) {
  return (
    <g
      className={`leg ${leg === null ? 'leg--placeholder' : ''} ${
        onClick ? 'leg--interactive' : ''
      }`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick && 'button'}
      aria-label={ariaLabel}
    >
      <rect className='road' x={0} y={0} width={legLength} height={legWidth} />
      {leg?.crosswalk && (
        <g className='crosswalk'>
          {range(crosswalkSegmentCount).map((segmentIndex) => (
            <rect
              className='crosswalk-stripe'
              key={segmentIndex}
              x={crosswalkOffset + circleRadius * 2}
              y={crosswalkSegmentLength * (segmentIndex * 2 + 1)}
              width={crosswalkLength}
              height={crosswalkSegmentLength}
            />
          ))}
        </g>
      )}
      {leg?.island && (
        <g className='island'>
          <rect
            className='island--inset'
            x={0}
            y={islandY}
            width={legLength}
            height={islandHeight}
            rx={islandHeight / 2}
          />
          <rect
            className='island--separator'
            x={crosswalkOffset}
            y={islandY}
            width={legLength - crosswalkOffset}
            height={islandHeight}
          />
        </g>
      )}
      <rect
        className='leg__focus-ring'
        x={0}
        y={0}
        width={legLength}
        height={legWidth}
      />
    </g>
  )
}
