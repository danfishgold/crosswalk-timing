import React, { MouseEvent, useEffect, useState } from 'react'
import JunctionBuilder from './JunctionBuilder'
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
  selectTrackTransitions,
  setRecordingDuration,
  Transition,
} from './reducer'
import { useDispatch, useSelector } from './store'
import { formatTimestamp } from './utils'

const green = '#28e23f'
const red = '#e91c32'

function App() {
  return (
    <div>
      <JunctionBuilder />
      <br />
      <br />
      <br />
      <br />
      <DurationInput />
      <TimelineEditor />
    </div>
  )
}

function DurationInput() {
  const dispatch = useDispatch()
  const duration = useSelector((state) => state.recordingDuration)
  const [value, setValue] = useState(formatTimestamp(duration))

  useEffect(() => {
    const match = value.match(/^(\d+):(\d\d)$/)
    const newDuration = match
      ? parseInt(match[1]) * 60 + parseInt(match[2])
      : null
    if (newDuration) {
      dispatch(setRecordingDuration(newDuration))
    }
  }, [value])

  return (
    <div>
      <label htmlFor='duration-input'>משך ההקלטה:</label>
      <input
        id='duration-input'
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}

function TimelineEditor() {
  const dispatch = useDispatch()
  const duration = useSelector((state) => state.recordingDuration)
  const suggestion = useSelector((state) => state.transitionSuggestion)
  const cursor = useSelector((state) => state.cursor)
  const crosswalkIds = useSelector(selectCrosswalkIds)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseMove={(event) =>
        dispatch(hoverOverTimeline(timestampFromEvent(event, duration)))
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

  const onTrackClick = (
    crosswalkId: CrosswalkId,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    const timestamp = timestampFromEvent(event, duration)
    dispatch(
      clickTimelineTrack({
        crosswalkId,
        timestamp,
        x: event.clientX,
        y: event.clientY,
      }),
    )
  }
  return (
    <div
      onClick={(event) => onTrackClick(crosswalkId, event)}
      onMouseMove={(event) =>
        dispatch(hoverOverTimeline(timestampFromEvent(event, duration)))
      }
      key={crosswalkIdString(crosswalkId)}
      style={{
        width: '100%',
        height: '30px',
        margin: '5px 0',
        border: '1px solid black',
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
        transform: 'translateX(-10px)',
        background:
          transition.toColor === 'green'
            ? `linear-gradient(to right, ${red}00 0% , ${red} 50%, ${green} 50%,  ${green}00 100%`
            : `linear-gradient(to right, ${green}00 0% , ${green} 50%, ${red} 50%,  ${red}00 100%`,
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

export default App
