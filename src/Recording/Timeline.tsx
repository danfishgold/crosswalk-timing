import {
  Button,
  ButtonGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  useToken,
} from '@chakra-ui/react'
import { MouseEvent, useMemo } from 'react'
import {
  cancelTransitionSuggestion,
  clickOnExistingTransition,
  clickTimelineTrack,
  confirmTransitionSuggestion,
  CrosswalkId,
  crosswalkKey,
  hoverOverTimeline,
  makeSelectCrosswalkTransitionsAndIds,
  moveOutsideTimeline,
  selectCrosswalkHighlightColors,
  selectCrosswalkIdsWithTrafficLights,
  Transition,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import { useColorColors } from '../styleUtils'
import { formatTimestamp } from '../utils'

export default function Timeline() {
  const dispatch = useDispatch()
  const duration = useSelector((state) => state.recordingDuration)
  const suggestion = useSelector((state) => state.transitionSuggestion)
  const cursorTimestamp = useSelector(
    (state) => state.cursor?.timestamp ?? null,
  )
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)

  return (
    <div
      css={{ position: 'relative', width: '100%' }}
      onMouseMove={(event) =>
        dispatch(
          hoverOverTimeline({
            timestamp: timestampFromEvent(event, duration),
          }),
        )
      }
      onMouseLeave={() => dispatch(moveOutsideTimeline())}
    >
      {crosswalkIds.map((crosswalkId) => (
        <CrosswalkTrack
          key={crosswalkKey(crosswalkId)}
          crosswalkId={crosswalkId}
        />
      ))}
      {cursorTimestamp !== null && (
        <div
          css={{
            position: 'absolute',
            top: 0,
            left: `${(cursorTimestamp / duration) * 100}%`,
            height: '100%',
            width: '1px',
            background: 'black',
            pointerEvents: 'none',
          }}
        ></div>
      )}
      <div
        css={{
          direction: 'ltr',
          marginLeft: `calc(${
            ((cursorTimestamp ?? 0) / duration) * 100
          }% + 5px)`,
          background: 'white',
          color: cursorTimestamp !== null ? 'black' : 'white',
        }}
      >
        {cursorTimestamp !== null ? formatTimestamp(cursorTimestamp) : 'hi'}
      </div>
    </div>
  )
}

function CrosswalkTrack({ crosswalkId }: { crosswalkId: CrosswalkId }) {
  const dispatch = useDispatch()
  const selectCrosswalkTransitionsAndIds = useMemo(
    makeSelectCrosswalkTransitionsAndIds,
    [],
  )
  const transitionsAndIds = useSelector((state) =>
    selectCrosswalkTransitionsAndIds(state, crosswalkId),
  )
  const duration = useSelector((state) => state.recordingDuration)
  const highlights = useSelector(selectCrosswalkHighlightColors)
  const isSelected = highlights[crosswalkKey(crosswalkId)] === 'highlight'
  const trackSuggestion = useSelector((state) =>
    state.transitionSuggestion?.crosswalkId
      ? crosswalkKey(state.transitionSuggestion.crosswalkId) ===
        crosswalkKey(crosswalkId)
        ? state.transitionSuggestion
        : null
      : null,
  )

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    dispatch(
      clickTimelineTrack({
        crosswalkId,
        timestamp: timestampFromEvent(event, duration),
        x: event.clientX,
        y: event.clientY,
      }),
    )
  }
  const background = useToken('colors', isSelected ? 'yellow.200' : 'white')

  return (
    <Popover
      isOpen={trackSuggestion !== null}
      onClose={() => dispatch(cancelTransitionSuggestion())}
    >
      <div
        onClick={onClick}
        onMouseMove={(event) => {
          event.stopPropagation()
          dispatch(
            hoverOverTimeline({
              timestamp: timestampFromEvent(event, duration),
              crosswalkId,
            }),
          )
        }}
        key={crosswalkKey(crosswalkId)}
        css={{
          width: '100%',
          height: '30px',
          margin: '5px 0',
          border: '1px solid black',
          background,
          position: 'relative',
        }}
      >
        {transitionsAndIds.map(([id, transition]) => (
          <TrackTransition key={id} transition={transition} id={id} />
        ))}
        <PopoverTrigger>
          <div
            css={{
              position: 'absolute',
              top: 0,
              height: '100%',
              left: `${((trackSuggestion?.timestamp ?? 0) / duration) * 100}%`,
            }}
          />
        </PopoverTrigger>
      </div>
      <PopoverContent css={{ direction: 'ltr' }}>
        <PopoverArrow />
        <PopoverBody>
          <PopoverCloseButton />
          <ButtonGroup size='sm' isAttached dir='ltr'>
            <Button
              colorScheme='green'
              onClick={() => dispatch(confirmTransitionSuggestion('green'))}
            >
              נהיה ירוק
            </Button>
            <Button
              colorScheme='red'
              onClick={() => dispatch(confirmTransitionSuggestion('red'))}
            >
              נהיה אדום
            </Button>
          </ButtonGroup>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

function TrackTransition({
  transition,
  id,
}: {
  transition: Transition
  id: string
}) {
  const dispatch = useDispatch()
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    dispatch(
      clickOnExistingTransition({ id, x: event.clientX, y: event.clientY }),
    )
  }
  const duration = useSelector((state) => state.recordingDuration)
  const colorColors = useColorColors()
  return (
    <div
      onClick={onClick}
      css={{
        position: 'absolute',
        top: 0,
        left: `${(transition.timestamp / duration) * 100}%`,
        width: '20px',
        height: '100%',
        background: `linear-gradient(to right, ${
          colorColors[transition.toColor]
        },  ${colorColors[transition.toColor]}00)`,
      }}
    ></div>
  )
}

function timestampFromEvent(
  event: MouseEvent<HTMLDivElement>,
  duration: number,
): number {
  const boundingRect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - boundingRect.x
  const timestamp = Math.round((x / boundingRect.width) * duration)
  return timestamp
}
