import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import Popover from './Popover'
import {
  addTransitionThroughForm,
  cancelTransitionSuggestion,
  clickOnExistingTransition,
  clickTimelineTrack,
  Color,
  confirmTransitionSuggestion,
  CrosswalkId,
  crosswalkKey,
  deleteTransitionFromList,
  Highlight,
  hoverOverTimeline,
  moveOutsideTimeline,
  selectCrosswalkHighlightColors,
  selectCrosswalkIds,
  selectCrosswalkTransitionsAndIds,
  Transition,
  updateTransitionInList,
} from './reducer'
import { useDispatch, useSelector } from './store'
import TimestampInput from './TimestampInput'
import { formatTimestamp } from './utils'

export const colorColors: Record<Color, string> = {
  green: '#28e23f',
  red: '#e91c32',
}
export const highlightColors: Record<Highlight, string> = {
  highlight: 'lightsalmon',
  ...colorColors,
}

export default function TimelineEditor() {
  const dispatch = useDispatch()
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const [transitionInForm, setTransitionInForm] = useState<Transition>({
    timestamp: 0,
    crosswalkId: crosswalkIds[0],
    toColor: 'green',
  })

  useEffect(() => {
    setTransitionInForm({ ...transitionInForm, crosswalkId: crosswalkIds[0] })
  }, [crosswalkIds])

  return (
    <div>
      <Timeline />
      <form
        onSubmit={(event) => {
          console.log('fsdfsd')
          event.preventDefault()
          dispatch(addTransitionThroughForm(transitionInForm))
        }}
      >
        <TransitionFormElements
          transition={transitionInForm}
          onChange={(transition) => setTransitionInForm(transition)}
          formIdPrefix='main-form'
        />
        <button type='submit'>הוספה</button>
      </form>
      <TransitionList />
    </div>
  )
}

function Timeline() {
  const dispatch = useDispatch()
  const duration = useSelector((state) => state.recordingDuration)
  const suggestion = useSelector((state) => state.transitionSuggestion)
  const cursor = useSelector((state) => state.cursor)
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const highlights = useSelector(selectCrosswalkHighlightColors)

  return (
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
          <button onClick={() => dispatch(confirmTransitionSuggestion('red'))}>
            נהיה אדום
          </button>
          <button onClick={() => dispatch(cancelTransitionSuggestion())}>
            ביטול
          </button>
        </Popover>
      )}
    </div>
  )
}

function TransitionFormElements({
  transition,
  onChange,
  formIdPrefix,
  isTrackIndexFieldHidden = false,
}: {
  transition: Transition
  onChange: (transition: Transition) => void
  formIdPrefix: string
  isTrackIndexFieldHidden?: boolean
}) {
  const crosswalkIds = useSelector(selectCrosswalkIds)

  const trackIndex = crosswalkIds.findIndex(
    (id) => crosswalkKey(id) === crosswalkKey(transition.crosswalkId),
  )

  const onCrosswalkChange = (event: ChangeEvent<HTMLInputElement>) => {
    const index = event.target.valueAsNumber - 1
    const crosswalkId = crosswalkIds[index]
    onChange({ ...transition, crosswalkId })
  }
  const onColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const toColor = event.target.value as Color
    onChange({ ...transition, toColor })
  }

  return (
    <>
      <TimestampInput
        timestamp={transition.timestamp}
        setTimestamp={(timestamp) => onChange({ ...transition, timestamp })}
      />
      {!isTrackIndexFieldHidden && (
        <input
          type='number'
          min={1}
          max={crosswalkIds.length}
          value={trackIndex + 1}
          onChange={onCrosswalkChange}
        />
      )}
      <input
        type='radio'
        name={`${formIdPrefix}-new-transition-color`}
        id={`${formIdPrefix}-new-transition-color--red`}
        value='red'
        checked={transition.toColor === 'red'}
        onChange={onColorChange}
      />
      <label htmlFor={`${formIdPrefix}-new-transition-color--red`}>אדום</label>
      <input
        type='radio'
        name={`${formIdPrefix}-new-transition-color`}
        id={`${formIdPrefix}-new-transition-color--green`}
        value='green'
        checked={transition.toColor === 'green'}
        onChange={onColorChange}
      />
      <label htmlFor={`${formIdPrefix}-new-transition-color--green`}>
        ירוק
      </label>
    </>
  )
}

function TransitionList() {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const highlights = useSelector(selectCrosswalkHighlightColors)

  return (
    <div>
      {crosswalkIds.map((id, index) => (
        <CrosswalkTransitionList
          key={crosswalkKey(id)}
          crosswalkId={id}
          index={index}
          highlight={highlights[crosswalkKey(id)]}
        />
      ))}
    </div>
  )
}

function CrosswalkTransitionList({
  crosswalkId,
  index,
  highlight,
}: {
  crosswalkId: CrosswalkId
  index: number
  highlight: Highlight | null
}) {
  const transitions = useSelector((state) =>
    selectCrosswalkTransitionsAndIds(state, crosswalkId),
  )

  const color = highlight ? highlightColors[highlight] : 'black'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '10px',
        minHeight: '50px',
        padding: '5px 5px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto',
          gridTemplateRows: '1fr auto 1fr',
          justifyItems: 'center',
        }}
      >
        <div style={{ width: '5px', height: '100%', background: color }} />
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '20px',
            background: color,
            color: 'white',
            textAlign: 'center',
          }}
        >
          {index + 1}
        </div>
        <div style={{ width: '5px', height: '100%', background: color }} />
      </div>
      <div>
        {transitions.length > 0 ? (
          transitions.map(([id]) => <TransitionRow key={id} id={id} />)
        ) : (
          <p>עוד אין תזמונים במעבר החציה הזה. אפשר להוסיף מעברים בחלק למעלה.</p>
        )}
      </div>
    </div>
  )
}

function TransitionRow({ id }: { id: string }) {
  const dispatch = useDispatch()
  const transition = useSelector((state) => state.transitions[id])

  return (
    <div>
      <TransitionFormElements
        transition={transition}
        onChange={(updatedTransition) =>
          dispatch(
            updateTransitionInList({ id, transition: updatedTransition }),
          )
        }
        formIdPrefix={id}
        isTrackIndexFieldHidden={true}
      />
      <button onClick={() => dispatch(deleteTransitionFromList(id))}>
        מחיקה
      </button>
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
  return (
    <div
      onClick={onClick}
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
