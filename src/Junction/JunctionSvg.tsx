import { useToken } from '@chakra-ui/system'
import { MouseEventHandler, useMemo } from 'react'
import {
  crosswalkKey,
  DiagonalCrosswalkId,
  DiagonalLeg,
  DiagonalLegId,
  diagonalLegIds,
  Highlight,
  Junction,
  LegId,
  MainCrosswalkId,
  MainLeg,
  mainLegIds,
  selectCrosswalkHighlightColors,
  selectCrosswalkIdsWithTrafficLights,
} from '../reducer'
import { useSelector } from '../store'
import { range } from '../utils'
import { useSvgParameters } from './svgParameters'

const legRotation: Record<LegId, number> = {
  n: -90,
  e: 0,
  s: 90,
  w: 180,
  ne: -90,
  se: 0,
  sw: 90,
  nw: 180,
}

export function JunctionSvg({
  inEditMode,
  onLegClick,
}: {
  inEditMode: boolean
  onLegClick: (legId: LegId) => void
}) {
  const junction = useSelector((state) => state.junction)
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)
  const highlights = useSelector(selectCrosswalkHighlightColors)
  const { legWidth, legLength } = useSvgParameters()
  const viewBoxOffset = legWidth / 2 + legLength

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
      {mainLegIds.map((legId) => (
        <g
          key={legId}
          transform={`rotate(${legRotation[legId]}) translate(${legWidth / 2},${
            -legWidth / 2
          })`}
        >
          {(inEditMode || junction[legId]) && (
            <MainJunctionLegGroup
              leg={junction[legId]}
              onClick={inEditMode ? () => onLegClick(legId) : undefined}
              ariaLabel={junction[legId] ? 'עריכת כביש' : 'הוספת כביש'}
            />
          )}
        </g>
      ))}
      {diagonalLegIds.map((legId) => (
        <g
          key={legId}
          transform={`rotate(${legRotation[legId]}) translate(${legWidth / 2},${
            legWidth / 2
          })`}
        >
          {((inEditMode && shouldShowDiagonalLeg(legId, junction)) ||
            junction[legId]) && (
            <DiagonalJunctionLegGroup
              leg={junction[legId]}
              onClick={inEditMode ? () => onLegClick(legId) : undefined}
              ariaLabel={junction[legId] ? 'עריכת כביש' : 'הוספת כביש'}
            />
          )}
        </g>
      ))}
      <g>
        {crosswalkIds.map((crosswalkId, index) =>
          crosswalkId.main ? (
            <MainCrosswalkIndicatorGroup
              key={crosswalkKey(crosswalkId)}
              crosswalkId={crosswalkId}
              highlight={highlights[crosswalkKey(crosswalkId)]}
              index={index}
            />
          ) : (
            <DiagonalCrosswalkIndicatorGroup
              key={crosswalkKey(crosswalkId)}
              crosswalkId={crosswalkId}
              highlight={highlights[crosswalkKey(crosswalkId)]}
              index={index}
            />
          ),
        )}
      </g>
    </svg>
  )
}

function MainCrosswalkIndicatorGroup({
  crosswalkId,
  highlight,
  index,
}: {
  crosswalkId: MainCrosswalkId
  highlight: Highlight | null
  index: number
}) {
  const {
    legWidth,
    circleRadius,
    crosswalkSegmentLength,
    crosswalkSegmentsInEachDirection,
    circleOffset: x,
  } = useSvgParameters()
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
      {!crosswalkId.part && (
        <line
          x1={x}
          x2={x}
          y1={y1}
          y2={y2}
          stroke={color}
          strokeWidth={crosswalkSegmentLength}
        />
      )}
      <circle cx={x} cy={(y1 + y2) / 2} r={circleRadius} fill={color} />
      <text
        x={0}
        y={0}
        fontSize={circleRadius * 1.3}
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

function DiagonalCrosswalkIndicatorGroup({
  crosswalkId,
  highlight,
  index,
}: {
  crosswalkId: DiagonalCrosswalkId
  highlight: Highlight | null
  index: number
}) {
  const { circleRadius, crosswalkSegmentLength, circleOffset } =
    useSvgParameters()

  const color = useToken('colors', highlight ? 'yellow.300' : 'black')
  return (
    <g transform={`rotate(${legRotation[crosswalkId.legId]})`}>
      <circle
        cx={circleOffset}
        cy={circleOffset}
        r={circleRadius}
        fill={color}
      />
      <text
        x={0}
        y={0}
        fontSize={circleRadius * 1.3}
        fill={highlight ? 'black' : 'white'}
        textAnchor='middle'
        alignmentBaseline='middle'
        transform={`translate(${circleOffset}, ${circleOffset}) rotate(${-legRotation[
          crosswalkId.legId
        ]})`}
      >
        {index + 1}
      </text>
    </g>
  )
}

function MainJunctionLegGroup({
  leg,
  onClick,
  ariaLabel,
}: {
  leg: MainLeg | null
  onClick?: MouseEventHandler<SVGElement>
  ariaLabel?: string
}) {
  const {
    legLength,
    legWidth,
    crosswalkSegmentCount,
    crosswalkOffset,
    crosswalkSegmentLength,
    crosswalkLength,
    islandY,
    islandHeight,
  } = useSvgParameters()
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
              x={crosswalkOffset}
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

function DiagonalJunctionLegGroup({
  leg,
  onClick,
  ariaLabel,
}: {
  leg: DiagonalLeg | null
  onClick?: MouseEventHandler<SVGElement>
  ariaLabel?: string
}) {
  const {
    legLength,
    crosswalkLength,
    crosswalkSegmentLength,
    crosswalkSegmentsInDiagonal,
    cornerWidth,
  } = useSvgParameters()
  const laneWidth =
    crosswalkSegmentLength * (2 * crosswalkSegmentsInDiagonal + 1)
  const straightLaneWidth = laneWidth * 0.8
  const turnOffset =
    legLength - cornerWidth - (laneWidth - straightLaneWidth) / (Math.SQRT2 - 1)
  const turnRadius = legLength - straightLaneWidth - turnOffset

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
      <rect className='road' x={0} y={0} width={legLength} height={legLength} />
      {leg && (
        <>
          <path
            d={[
              pathCommand('M', legLength, legLength),
              pathCommand('L', legLength, straightLaneWidth),
              pathCommand('L', legLength - turnOffset, straightLaneWidth),
              pathCommand(
                'A',
                turnRadius,
                turnRadius,
                0,
                0,
                0,
                straightLaneWidth,
                legLength - turnOffset,
              ),
              pathCommand('L', straightLaneWidth, legLength),
              pathCommand('Z'),
            ].join(' ')}
            fill='white'
          />
          <path
            className='diagonal-island'
            d={[
              pathCommand('M', 0, 0),
              pathCommand('L', cornerWidth, 0),
              pathCommand(
                'A',
                cornerWidth,
                cornerWidth,
                0,
                0,
                0,
                0,
                cornerWidth,
              ),
              pathCommand('L', 0, cornerWidth),
              pathCommand('Z'),
            ].join(' ')}
          />
          <g className='crosswalk'>
            {range(crosswalkSegmentsInDiagonal).map((segmentIndex) => (
              <rect
                className='crosswalk-stripe'
                key={segmentIndex}
                x={-crosswalkLength / 2}
                y={
                  cornerWidth * (Math.SQRT2 - 1) +
                  crosswalkSegmentLength * (segmentIndex * 2 + 1)
                }
                width={crosswalkLength}
                height={crosswalkSegmentLength}
                transform='rotate(-45)'
              />
            ))}
          </g>
        </>
      )}
      <rect
        className='leg__focus-ring'
        x={0}
        y={0}
        width={legLength}
        height={legLength}
      />
    </g>
  )
}

function pathCommand(
  command: 'M' | 'L' | 'A' | 'Z',
  ...args: number[]
): string {
  return `${command}${args.join(',')}`
}

function shouldShowDiagonalLeg(
  diagonalLegId: DiagonalLegId,
  junction: Junction,
): boolean {
  const northSouth = diagonalLegId[0] as 'n' | 's'
  const eastWest = diagonalLegId[1] as 'e' | 'w'
  return junction[northSouth] !== null && junction[eastWest] !== null
}
