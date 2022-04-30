import React, { MouseEvent } from 'react'
import Popover from './Popover'
import {
  clickTimelineTrack,
  confirmTransitionSuggestion,
  CrosswalkId,
  crosswalkIdString,
  dismissTransitionSuggestion,
  hoverOverTimeline,
  moveOutsideTimeline,
  selectCrosswalkIds,
  selectIsCrosswalkSelected,
  selectTrackTransitions,
  Transition,
} from './reducer'
import { useDispatch, useSelector } from './store'
import { formatTimestamp } from './utils'

const green = '#28e23f'
const red = '#e91c32'

export default function TimelineEditor() {
  const dispatch = useDispatch()
  const duration = useSelector((state) => state.recordingDuration)
  const suggestion = useSelector((state) => state.transitionSuggestion)
  const cursor = useSelector((state) => state.cursor)
  const crosswalkIds = useSelector(selectCrosswalkIds)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseMove={(event) =>
        dispatch(
          hoverOverTimeline({ timestamp: timestampFromEvent(event, duration) }),
        )
      }
      onMouseLeave={() => dispatch(moveOutsideTimeline())}
    >
      {crosswalkIds.map((crosswalkId) => (
        <CrosswalkTrack
          key={crosswalkIdString(crosswalkId)}
          crosswalkId={crosswalkId}
        />
      ))}
      {cursor && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${(cursor.timestamp / duration) * 100}%`,
            height: '100%',
            width: '1px',
            background: 'black',
            pointerEvents: 'none',
          }}
        ></div>
      )}
      {cursor && (
        <div
          style={{
            marginLeft: `${(cursor.timestamp / duration) * 100}%`,
            background: 'white',
          }}
        >
          {formatTimestamp(cursor.timestamp)}
        </div>
      )}
      {suggestion && (
        <Popover x={suggestion.x} y={suggestion.y}>
          <button
            onClick={() => dispatch(confirmTransitionSuggestion('green'))}
          >
            נהיה ירוק
          </button>
          <button onClick={() => dispatch(confirmTransitionSuggestion('red'))}>
            נהיה אדום
          </button>
          <button onClick={() => dispatch(dismissTransitionSuggestion())}>
            חזל״ש
          </button>
        </Popover>
      )}
    </div>
  )
}

function CrosswalkTrack({ crosswalkId }: { crosswalkId: CrosswalkId }) {
  const dispatch = useDispatch()
  const transitions = useSelector((state) =>
    selectTrackTransitions(state, crosswalkId),
  )
  const duration = useSelector((state) => state.recordingDuration)
  const isSelected = useSelector((state) =>
    selectIsCrosswalkSelected(state, crosswalkId),
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
      key={crosswalkIdString(crosswalkId)}
      style={{
        width: '100%',
        height: '30px',
        margin: '5px 0',
        border: '1px solid black',
        background: isSelected ? 'lightsalmon' : 'white',
        position: 'relative',
      }}
    >
      {transitions.map((transition) => (
        <TrackTransition key={transition.id} transition={transition} />
      ))}
    </div>
  )
}

function TrackTransition({ transition }: { transition: Transition }) {
  const duration = useSelector((state) => state.recordingDuration)
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: `${(transition.timestamp / duration) * 100}%`,
        width: '20px',
        height: '100%',
        background:
          transition.toColor === 'green'
            ? `linear-gradient(to right, ${green},  ${green}00`
            : `linear-gradient(to right, ${red},  ${red}00`,
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
