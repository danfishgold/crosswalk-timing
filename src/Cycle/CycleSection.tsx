import React from 'react'
import {
  Cycle,
  selectPossibleCycleDurations,
  setCycleDuraration,
  setCycleOffset,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import { formatTimestamp } from '../utils'
import CycleDiagram from './CycleDiagram'

export default function CycleSection() {
  const cycle = useSelector((state) => state.cycle)

  return (
    <div>
      <h2>מחזור</h2>
      <CycleDurationSelector />
      {cycle && (
        <>
          <CycleOffsetInput cycle={cycle} />
          <CycleDiagram cycle={cycle} />
        </>
      )}
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

function CycleOffsetInput({ cycle }: { cycle: Cycle }) {
  const dispatch = useDispatch()

  return (
    <div>
      <label htmlFor='cycle-offset-input'>
        אני לא זוכר איך אומרים אופסט בעברית (בשניות):
      </label>
      <input
        id='cycle-offset-input'
        type='number'
        value={cycle.recordingOffset}
        onChange={(event) =>
          dispatch(setCycleOffset(event.target.valueAsNumber))
        }
      />
    </div>
  )
}
