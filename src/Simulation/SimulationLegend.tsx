import {
  Table,
  TableCaption,
  TableContainer,
  Tag,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { selectCrosswalkIdsWithTrafficLights } from '../reducer'
import { crosswalkKey, diagonalLegIds, LegId, mainLegIds } from '../state'
import { useSelector } from '../store'
import { compact, formatTimestamp, mod, sum } from '../utils'
import { Journey } from './SimulationVisualization'
import { JourneyDurationData } from './useJourneyDurations'

export default function SimulationLegend({
  journeys,
  data,
  className,
}: {
  journeys: Journey[]
  data: JourneyDurationData
  className?: string
}) {
  const caption = useWalkTimeCaption()
  return (
    <TableContainer overflowX='scroll' className={className}>
      <Table size='sm' colorScheme='black'>
        {caption && <TableCaption>{caption}</TableCaption>}
        <Thead>
          <Tr>
            <Th scope='col' rowSpan={2} textAlign='center'>
              מסלול
            </Th>
            <Th rowSpan={2} />
            <Th colSpan={4} scope='colgroup' textAlign='center'>
              משך חציית הצומת*
            </Th>
          </Tr>
          <Tr>
            <Th scope='col' textAlign='center'>
              מינימלי
            </Th>
            <Th scope='col' textAlign='center'>
              מקסימלי
            </Th>
            <Th scope='col' textAlign='center'>
              ממוצע
            </Th>
            <Th scope='col' textAlign='center'>
              ביום כיפור
            </Th>
          </Tr>
        </Thead>
        <tbody>
          {journeys.map((journey) => (
            <JourneyRow key={journey.key} journey={journey} data={data} />
          ))}
        </tbody>
      </Table>
    </TableContainer>
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
      <Td dir='ltr' textAlign='center'>
        <Tag variant='solid' colorScheme={journey.color}>
          {journey.title}
        </Tag>
      </Td>
      <Td>
        <LittleJourneyDiagram journey={journey} />
      </Td>
      <Td textAlign='center'>{formatTimestamp(stats.min)}</Td>
      <Td textAlign='center'>{formatTimestamp(stats.max)}</Td>
      <Td textAlign='center'>{formatTimestamp(stats.mean)}</Td>
      <Td textAlign='center'>{formatTimestamp(stats.kippur)}</Td>
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

const legWidth = 30
const legLength = 50
const diagonalWidth = (1 / 2) * legLength
const roadColor = '#ccc'
const arrowColor = '#000'
const arrowWidth = 6
const arrowHeadLength = 12

const viewBoxOffset = legWidth / 2 + legLength

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

function LittleJourneyDiagram({ journey }: { journey: Journey }) {
  const junction = useSelector((state) => state.junction)
  const junctionRotation = useSelector((state) => state.junctionRotation)

  const isClockwise = useMemo(() => {
    if (journey.crosswalkIds.length < 2) {
      return true
    }
    const secondToLastLeg = journey.crosswalkIds.at(-2)!
    const lastLeg = journey.crosswalkIds.at(-1)!
    const secondToLastRotation = legRotation[secondToLastLeg.legId]
    const lastRotation = legRotation[lastLeg.legId]
    const rotationDiff =
      mod(lastRotation - secondToLastRotation + 180, 360) - 180
    return rotationDiff >= 0
  }, [journey])

  const junctionRotationInRadians = junctionRotation * (Math.PI / 180)
  const scale =
    Math.abs(Math.cos(junctionRotationInRadians)) +
    Math.abs(Math.sin(junctionRotationInRadians))

  return (
    <svg
      viewBox={`${-viewBoxOffset} ${-viewBoxOffset} ${2 * viewBoxOffset} ${
        2 * viewBoxOffset
      }`}
      css={{ width: `${40 * scale}px` }}
    >
      <g transform={`rotate(${junctionRotation}) scale(${1 / scale})`}>
        <rect
          x={-legWidth / 2}
          y={-legWidth / 2}
          width={legWidth}
          height={legWidth}
          fill={roadColor}
        />
        {mainLegIds.map(
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
        {diagonalLegIds.map(
          (legId) =>
            junction[legId] && (
              <path
                key={legId}
                d={[
                  `M ${legWidth / 2 + legLength} ${legWidth / 2}`,
                  `L ${legWidth / 2 + legLength - diagonalWidth} ${
                    legWidth / 2
                  }`,
                  `L ${legWidth / 2} ${
                    legWidth / 2 + legLength - diagonalWidth
                  }`,
                  `L ${legWidth / 2} ${legWidth / 2 + legLength}`,
                  `Z`,
                ].join(' ')}
                fill={roadColor}
                transform={`rotate(${legRotation[legId]})`}
              />
            ),
        )}
        {journey.crosswalkIds.map((id, index) => {
          const x = legWidth / 2 + (legLength - diagonalWidth) / 3
          if (id.main) {
            const y1 = id.part === 'second' ? 0 : -x
            const y2 = id.part === 'first' ? 0 : x

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
                {index === journey.crosswalkIds.length - 1 && (
                  <ArrowHead x={x} y1={y1} y2={y2} isOnTop={isClockwise} />
                )}
              </g>
            )
          } else {
            const x2 = legWidth + legLength - x - legLength / 7
            return (
              <g
                key={crosswalkKey(id)}
                transform={`rotate(${legRotation[id.legId]})`}
              >
                <line
                  x1={x}
                  x2={x2}
                  y1={x}
                  y2={x2}
                  stroke={arrowColor}
                  strokeWidth={arrowWidth}
                  strokeLinecap='round'
                />
                {index === journey.crosswalkIds.length - 1 && (
                  <DiagonalArrowHead x={x2} y={x2} />
                )}
              </g>
            )
          }
        })}
      </g>
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
    ? y2 - arrowHeadLength * Math.SQRT1_2
    : y1 + arrowHeadLength * Math.SQRT1_2
  return (
    <>
      <line
        x1={x}
        y1={y0}
        x2={x + arrowHeadLength * Math.SQRT1_2}
        y2={yd}
        stroke={arrowColor}
        strokeWidth={arrowWidth}
        strokeLinecap='round'
      />
      <line
        x1={x}
        y1={y0}
        x2={x - arrowHeadLength * Math.SQRT1_2}
        y2={yd}
        stroke={arrowColor}
        strokeWidth={arrowWidth}
        strokeLinecap='round'
      />
    </>
  )
}

function DiagonalArrowHead({ x, y }: { x: number; y: number }) {
  return (
    <>
      <line
        x1={x}
        y1={y}
        x2={x - arrowHeadLength}
        y2={y}
        stroke={arrowColor}
        strokeWidth={arrowWidth}
        strokeLinecap='round'
      />
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y - arrowHeadLength}
        stroke={arrowColor}
        strokeWidth={arrowWidth}
        strokeLinecap='round'
      />
    </>
  )
}

function useWalkTimeCaption() {
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)
  const walkTimes = useSelector((state) => state.walkTimes)

  const times = crosswalkIds
    .map(
      (id, index) => `${walkTimes[crosswalkKey(id)]} שניות במעבר ${index + 1}`,
    )
    .join(', ')

  if (!times) {
    return null
  }

  return `*בהנחה של משך החציה הבא לכל מעבר חציה: ${times}`
}
