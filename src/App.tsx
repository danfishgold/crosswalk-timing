import React, { useEffect, useState } from 'react'
import CycleDiagram from './CycleDiagram'
import JunctionBuilder from './JunctionBuilder'
import {
  selectPossibleCycleDurations,
  setCycleDuraration,
  setRecordingDuration,
} from './reducer'
import { useDispatch, useSelector } from './store'
import TimelineEditor from './TimelineEditor'
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
      <DurationInput />
      <TimelineEditor />
      <CycleDurationSelector />
      <CycleDiagram />
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
