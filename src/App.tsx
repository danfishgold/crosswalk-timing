import React from 'react'
import CycleDiagram from './CycleDiagram'
import JunctionBuilder from './JunctionBuilder'
import {
  selectPossibleCycleDurations,
  setCycleDuraration,
  setRecordingDuration,
} from './reducer'
import { useDispatch, useSelector } from './store'
import TimelineEditor from './TimelineEditor'
import TimestampInput from './TimestampInput'
import { formatTimestamp } from './utils'

function App() {
  return (
    <div>
      <JunctionBuilder />
      <br />
      <br />
      <br />
      <br />
      <h2>הקלטה</h2>
      <RecordingDurationEditor />
      <TimelineEditor />
      <CycleDurationSelector />
      <CycleDiagram />
    </div>
  )
}

function RecordingDurationEditor() {
  const dispatch = useDispatch()
  const duration = useSelector((state) => state.recordingDuration)

  return (
    <div>
      <label htmlFor='duration-input'>משך ההקלטה:</label>
      <TimestampInput
        timestamp={duration}
        setTimestamp={(value) => dispatch(setRecordingDuration(value))}
        id='duration-input'
      />
    </div>
  )
}

function CycleDurationSelector() {
  const dispatch = useDispatch()
  const possibleDurations = useSelector(selectPossibleCycleDurations)
  if (possibleDurations.length === 0) {
    return (
      <div>
        <p>
          סמנו זמני אירועי רמזורים בחלק למעלה כדי לקבל הצעות לחישוב זמן המחזור
          של הצומת
        </p>
      </div>
    )
  }
  return (
    <div>
      <span>זמני מחזור אפשריים:</span>
      {possibleDurations.map((duration, index) => (
        <button
          key={index}
          onClick={() => dispatch(setCycleDuraration(duration))}
        >
          {formatTimestamp(duration)}
        </button>
      ))}
    </div>
  )
}

export default App
