import { Button, ButtonGroup, useToken } from '@chakra-ui/react'
import React, { MouseEvent, useMemo } from 'react'
import Popover from '../Popover'
import {
  cancelTransitionSuggestion,
  clickOnExistingTransition,
  clickTimelineTrack,
  confirmTransitionSuggestion,
  CrosswalkId,
  crosswalkKey,
  Highlight,
  hoverOverTimeline,
  makeSelectCrosswalkTransitionsAndIds,
  moveOutsideTimeline,
  selectCrosswalkHighlightColors,
  selectCrosswalkIds,
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
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const highlights = useSelector(selectCrosswalkHighlightColors)

  return (
    <div
      css={{ position: 'relative' }}
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
          highlight={highlights[crosswalkKey(crosswalkId)]}
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
      {cursorTimestamp !== null && (
        <div
          css={{
            marginLeft: `${(cursorTimestamp / duration) * 100}%`,
            background: 'white',
          }}
        >
          {formatTimestamp(cursorTimestamp)}
        </div>
      )}
      {suggestion && (
        <Popover x={suggestion.x} y={suggestion.y}>
          <ButtonGroup size='sm' isAttached dir='ltr'>
            <Button onClick={() => dispatch(cancelTransitionSuggestion())}>
              ביטול
            </Button>
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
        </Popover>
      )}
    </div>
  )
}

function CrosswalkTrack({
  crosswalkId,
  highlight,
}: {
  crosswalkId: CrosswalkId
  highlight: Highlight | null
}) {
  const dispatch = useDispatch()
  const selectCrosswalkTransitionsAndIds = useMemo(
    makeSelectCrosswalkTransitionsAndIds,
    [],
  )
  const transitionsAndIds = useSelector((state) =>
    selectCrosswalkTransitionsAndIds(state, crosswalkId),
  )
  const duration = useSelector((state) => state.recordingDuration)
  const isSelected = highlight === 'highlight'

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
  const background = useToken('colors', isSelected ? 'orange.400' : 'white')

  return (
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
    </div>
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
