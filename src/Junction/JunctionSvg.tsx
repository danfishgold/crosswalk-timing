import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/popover'
import { Button, HStack, Portal, useDisclosure, VStack } from '@chakra-ui/react'
import {
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  PropsWithChildren,
  useMemo,
} from 'react'
import { selectCrosswalkIdsWithTrafficLights, setLeg } from '../reducer'
import {
  crosswalkKey,
  DiagonalCrosswalkId,
  DiagonalLeg,
  DiagonalLegId,
  isMainLegId,
  Junction,
  LegId,
  legIds,
  MainCrosswalkId,
  MainLeg,
} from '../state'
import { useDispatch, useSelector } from '../store'
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

const focusRingWeight = 2

export function JunctionSvg({ inEditMode }: { inEditMode: boolean }) {
  const junction = useSelector((state) => state.junction)
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)
  const { legWidth, legLength, scale, rotation } = useSvgParameters()
  const viewBoxOffset = legWidth / 2 + legLength

  const sideSizeInPixels = 250

  return (
    <svg
      css={{
        height: `${sideSizeInPixels * scale}px`,
        width: `${sideSizeInPixels * scale}px`,
      }}
      viewBox={`${-viewBoxOffset} ${-viewBoxOffset} ${viewBoxOffset * 2} ${
        viewBoxOffset * 2
      }`}
    >
      <g transform={`rotate(${rotation}) scale(${1 / scale})`}>
        {' '}
        <rect
          className='background'
          x={-viewBoxOffset}
          y={-viewBoxOffset}
          width={viewBoxOffset * 2}
          height={viewBoxOffset * 2}
        />
        <rect
          className='road'
          x={-legWidth / 2}
          y={-legWidth / 2}
          width={legWidth}
          height={legWidth}
        />
        {legIds.map((legId) =>
          isMainLegId(legId) ? (
            <g
              key={legId}
              transform={`rotate(${legRotation[legId]}) translate(${
                legWidth / 2
              },${-legWidth / 2})`}
            >
              <LegPopover legId={legId}>
                {junction[legId] ? (
                  <MainRoadBlock
                    leg={junction[legId]!}
                    interactive={inEditMode}
                  />
                ) : inEditMode ? (
                  <AddButton cx={legLength / 2} cy={legWidth / 2} />
                ) : null}
              </LegPopover>
            </g>
          ) : (
            <g
              key={legId}
              transform={`rotate(${legRotation[legId]}) translate(${
                legWidth / 2
              },${legWidth / 2})`}
            >
              <LegPopover legId={legId}>
                {junction[legId] ? (
                  <DiagonalRoadBlock interactive={inEditMode} />
                ) : inEditMode &&
                  shouldShowDiagonalLegPlaceholder(legId, junction) ? (
                  <AddButton cx={legLength / 2} cy={legLength / 2} />
                ) : null}
              </LegPopover>
            </g>
          ),
        )}
        <g>
          {crosswalkIds.map((crosswalkId, index) =>
            crosswalkId.main ? (
              <MainIndex
                key={crosswalkKey(crosswalkId)}
                crosswalkId={crosswalkId}
                index={index}
              />
            ) : (
              <DiagonalIndex
                key={crosswalkKey(crosswalkId)}
                crosswalkId={crosswalkId}
                index={index}
              />
            ),
          )}
        </g>
      </g>
    </svg>
  )
}

function MainIndex({
  crosswalkId,
  index,
}: {
  crosswalkId: MainCrosswalkId
  index: number
}) {
  const {
    legWidth,
    circleRadius,
    crosswalkSegmentLength,
    crosswalkSegmentsInEachDirection,
    circleOffset: x,
    rotation,
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

  return (
    <g
      className='index-indicator'
      transform={`rotate(${legRotation[crosswalkId.legId]})`}
    >
      {!crosswalkId.part && (
        <rect
          x={x - crosswalkSegmentLength / 2}
          y={y1}
          width={crosswalkSegmentLength}
          height={y2 - y1}
        />
      )}
      <circle cx={x} cy={(y1 + y2) / 2} r={circleRadius} />
      <text
        x={0}
        y={0}
        fontSize={circleRadius * 1.3}
        textAnchor='middle'
        alignmentBaseline='middle'
        transform={`translate(${x}, ${(y1 + y2) / 2}) rotate(${
          -legRotation[crosswalkId.legId] - rotation
        })`}
      >
        {index + 1}
      </text>
    </g>
  )
}

function DiagonalIndex({
  crosswalkId,
  index,
}: {
  crosswalkId: DiagonalCrosswalkId
  index: number
}) {
  const { circleRadius, circleOffset, rotation } = useSvgParameters()

  return (
    <g
      className='index-indicator'
      transform={`rotate(${legRotation[crosswalkId.legId]})`}
    >
      <circle cx={circleOffset} cy={circleOffset} r={circleRadius} />
      <text
        x={0}
        y={0}
        fontSize={circleRadius * 1.3}
        textAnchor='middle'
        alignmentBaseline='middle'
        transform={`translate(${circleOffset}, ${circleOffset}) rotate(${
          -legRotation[crosswalkId.legId] - rotation
        })`}
      >
        {index + 1}
      </text>
    </g>
  )
}

const MainRoadBlock = forwardRef(
  (
    {
      leg,
      onClick,
      interactive,
    }: {
      leg: MainLeg
      onClick?: () => void
      interactive: boolean
    },
    ref: ForwardedRef<SVGGElement>,
  ) => {
    const onKeyDown = (event: KeyboardEvent<SVGElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        onClick?.()
      }
    }
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
        className='leg'
        onClick={interactive ? onClick : undefined}
        onKeyDown={interactive ? onKeyDown : undefined}
        tabIndex={interactive ? 0 : -1}
        role={interactive ? 'button' : undefined}
        ref={interactive ? ref : undefined}
      >
        <rect
          className='road'
          x={0}
          y={0}
          width={legLength}
          height={legWidth}
        />
        {leg.crosswalk && (
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
        {leg.island && (
          <>
            <rect
              className='island'
              x={0}
              y={islandY}
              width={legLength}
              height={islandHeight}
              rx={islandHeight / 2}
            />
            <rect
              className='island'
              x={crosswalkOffset}
              y={islandY}
              width={legLength - crosswalkOffset}
              height={islandHeight}
            />
          </>
        )}
        <LegFocusRing width={legLength} height={legWidth} />
      </g>
    )
  },
)

const DiagonalRoadBlock = forwardRef(
  (
    {
      onClick,
      interactive,
    }: {
      onClick?: () => void
      interactive: boolean
    },
    ref: ForwardedRef<SVGGElement>,
  ) => {
    const onKeyDown = (event: KeyboardEvent<SVGElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        onClick?.()
      }
    }
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
      legLength -
      cornerWidth -
      (laneWidth - straightLaneWidth) / (Math.SQRT2 - 1)
    const turnRadius = legLength - straightLaneWidth - turnOffset

    return (
      <g
        className='leg'
        onClick={interactive ? onClick : undefined}
        onKeyDown={interactive ? onKeyDown : undefined}
        tabIndex={interactive ? 0 : -1}
        role={interactive ? 'button' : undefined}
        ref={interactive ? ref : undefined}
      >
        <rect
          className='road'
          x={0}
          y={0}
          width={legLength}
          height={legLength}
        />
        <path
          className='background'
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
          className='island'
          d={[
            pathCommand('M', 0, 0),
            pathCommand('L', cornerWidth, 0),
            pathCommand('A', cornerWidth, cornerWidth, 0, 0, 0, 0, cornerWidth),
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
        <LegFocusRing width={legLength} height={legLength} />
      </g>
    )
  },
)

function pathCommand(
  command: 'M' | 'L' | 'A' | 'Z',
  ...args: number[]
): string {
  return `${command}${args.join(',')}`
}

function shouldShowDiagonalLegPlaceholder(
  diagonalLegId: DiagonalLegId,
  junction: Junction,
): boolean {
  const northSouth = diagonalLegId[0] as 'n' | 's'
  const eastWest = diagonalLegId[1] as 'e' | 'w'
  return junction[northSouth] !== null && junction[eastWest] !== null
}

function LegPopover({ legId, children }: PropsWithChildren<{ legId: LegId }>) {
  const { onOpen, onClose, isOpen } = useDisclosure()

  if (!children) {
    return null
  }
  return (
    <Popover closeOnBlur isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody>
            <LegPopoverMenu legId={legId} closeMenu={onClose} />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

function LegPopoverMenu({
  legId,
  closeMenu,
}: {
  legId: LegId
  closeMenu: () => void
}) {
  const dispatch = useDispatch()

  const legOptions = isMainLegId(legId) ? mainLegOptions : diagonalLegOptions
  const { legLength, scale, rotation } = useSvgParameters()
  const transform = [
    `translate(${legLength / 2}, ${legLength / 2})`,
    `rotate(${legRotation[legId] + rotation})`,
    `scale(${1 / scale})`,
    `translate(${-legLength / 2}, ${-legLength / 2})`,
  ].join(' ')
  return (
    <VStack align='start'>
      {legOptions.map((option) => (
        <HStack key={option.title}>
          <svg
            width={legLength * scale}
            height={legLength * scale}
            viewBox={`${0} ${0} ${legLength} ${legLength}`}
          >
            {!option.leg ? null : option.leg.main ? (
              <g transform={transform}>
                <MainRoadBlock leg={option.leg} interactive={false} />
              </g>
            ) : (
              <g transform={transform}>
                <DiagonalRoadBlock interactive={false} />
              </g>
            )}
          </svg>
          <Button
            size='sm'
            onClick={() => {
              dispatch(setLeg({ legId, leg: option.leg }))
              closeMenu()
            }}
          >
            {option.title}
          </Button>
        </HStack>
      ))}
    </VStack>
  )
}

const mainLegOptions: { title: string; leg: MainLeg | null }[] = [
  { title: 'שום כלום', leg: null },
  { title: 'מעבר חציה', leg: { main: true, crosswalk: true, island: false } },
  {
    title: 'מעבר חציה עם מפרדה',
    leg: { main: true, crosswalk: true, island: true },
  },
  { title: 'כביש', leg: { main: true, crosswalk: false, island: false } },
  {
    title: 'כביש עם מפרדה',
    leg: { main: true, crosswalk: false, island: true },
  },
]

const diagonalLegOptions: { title: string; leg: DiagonalLeg | null }[] = [
  { title: 'שום כלום', leg: null },
  { title: 'מעבר חציה', leg: { main: false, trafficLight: true } },
]

const AddButton = forwardRef(
  (
    {
      cx,
      cy,
      onClick,
    }: {
      cx: number
      cy: number
      onClick?: () => void
    },
    ref: ForwardedRef<SVGGElement>,
  ) => {
    const { legLength, legWidth, rotation } = useSvgParameters()
    const r = Math.min(legLength, legWidth) / 4
    const rectLength = r * 0.95
    const rectWidth = r * 0.15
    const onKeyDown = (event: KeyboardEvent<SVGElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        onClick?.()
      }
    }
    return (
      <g
        className='add-button'
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role='button'
        aria-label='הוספת כביש'
        ref={ref}
      >
        <circle cx={cx} cy={cy} r={r} />
        <circle
          className='add-button__focus-ring'
          cx={cx}
          cy={cy}
          r={r + focusRingWeight / 2}
          fill='none'
          strokeWidth={focusRingWeight}
        />
        <g transform={`translate(${cx}, ${cy}) rotate(${-rotation})`}>
          <rect
            x={-rectWidth / 2}
            y={-rectLength / 2}
            width={rectWidth}
            height={rectLength}
            fill='white'
          />
          <rect
            x={-rectLength / 2}
            y={-rectWidth / 2}
            width={rectLength}
            height={rectWidth}
            fill='white'
          />
        </g>
      </g>
    )
  },
)

function LegFocusRing({ width, height }: { width: number; height: number }) {
  return (
    <rect
      className='leg__focus-ring'
      x={focusRingWeight / 2}
      y={focusRingWeight / 2}
      width={width - focusRingWeight}
      height={height - focusRingWeight}
      fill='none'
      strokeWidth={focusRingWeight}
    />
  )
}
