import React from 'react'
import CycleDiagram from './CycleDiagram'
import JunctionBuilder from './JunctionBuilder'
import RecordingSection from './Recording/RecordingSection'
import { selectPossibleCycleDurations, setCycleDuraration } from './reducer'
import { useDispatch, useSelector } from './store'
import { formatTimestamp } from './utils'

function App() {
  return (
    <div>
      <p>
        <strong>נוהל בטא</strong>: אם תנסו לשבור זה ישבר. אם תנסו להשתמש בזה
        בטלפון זה כנראה גם ישבר
      </p>
      <JunctionBuilder />
      <br />
      <br />
      <br />
      <br />

      <RecordingSection />
      <CycleDurationSelector />
      <CycleDiagram />
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
