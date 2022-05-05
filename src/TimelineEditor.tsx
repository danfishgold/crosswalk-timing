import React, { MouseEvent, useState } from 'react'
import Popover from './Popover'
import {
  addTransitionThroughForm,
  clickTimelineTrack,
  Color,
  confirmTransitionSuggestion,
  CrosswalkId,
  crosswalkKey,
  dismissTransitionSuggestion,
  Highlight,
  hoverOverTimeline,
  moveOutsideTimeline,
  selectCrosswalkHighlightColors,
  selectCrosswalkIds,
  selectCrosswalkTransitionsAndIds,
  Transition,
} from './reducer'
import { useDispatch, useSelector } from './store'
import TimestampInput from './TimestampInput'
import { formatTimestamp } from './utils'

export const colorColors: Record<Color, string> = {
  green: '#28e23f',
  red: '#e91c32',
}

export default function TimelineEditor() {
  const dispatch = useDispatch()
  const duration = useSelector((state) => state.recordingDuration)
  const suggestion = useSelector((state) => state.transitionSuggestion)
  const cursor = useSelector((state) => state.cursor)
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const highlights = useSelector(selectCrosswalkHighlightColors)

  return (
    <div>
      <div
        style={{ position: 'relative' }}
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
            <button
              onClick={() => dispatch(confirmTransitionSuggestion('red'))}
            >
              נהיה אדום
            </button>
            <button onClick={() => dispatch(dismissTransitionSuggestion())}>
              חזל״ש
            </button>
          </Popover>
        )}
      </div>
      <TransitionForm />
      <TransitionList />
    </div>
  )
}

function TransitionForm() {
  const dispatch = useDispatch()
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const [timestamp, setTimestamp] = useState(0)
  const [trackIndex, setTrackIndex] = useState(0)
  const [color, setColor] = useState<Color>('green')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        dispatch(
          addTransitionThroughForm({
            timestamp,
            crosswalkId: crosswalkIds[trackIndex],
            toColor: color,
          }),
        )
      }}
    >
      <TimestampInput timestamp={timestamp} setTimestamp={setTimestamp} />
      <input
        type='number'
        min={1}
        max={crosswalkIds.length}
        value={trackIndex + 1}
        onChange={(event) => setTrackIndex(event.target.valueAsNumber - 1)}
      />
      <input
        type='radio'
        name='new-transition-color'
        id='new-transition-color--red'
        value='red'
        checked={color === 'red'}
        onChange={(event) => setColor(event.target.value as Color)}
      />
      <label htmlFor='new-transition-color--red'>אדום</label>
      <input
        type='radio'
        name='new-transition-color'
        id='new-transition-color--green'
        value='green'
        checked={color === 'green'}
        onChange={(event) => setColor(event.target.value as Color)}
      />
      <label htmlFor='new-transition-color--green'>ירוק</label>
      <button type='submit'>הוספה</button>
    </form>
  )
}

function TransitionList() {
  return <div></div>
}

function CrosswalkTrack({
  crosswalkId,
  highlight,
}: {
  crosswalkId: CrosswalkId
  highlight: Highlight | null
}) {
  const dispatch = useDispatch()
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
      style={{
        width: '100%',
        height: '30px',
        margin: '5px 0',
        border: '1px solid black',
        background: isSelected ? 'lightsalmon' : 'white',
        position: 'relative',
      }}
    >
      {transitionsAndIds.map(([id, transition]) => (
        <TrackTransition key={id} transition={transition} />
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
        background: `linear-gradient(to right, ${
          colorColors[transition.toColor]
        },  ${colorColors[transition.toColor]}00`,
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
