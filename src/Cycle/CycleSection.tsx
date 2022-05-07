import React from 'react'
import {
  Cycle,
  selectCycleDurationSuggestions,
  setCycleDuraration,
  setCycleOffset,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import { formatTimestamp } from '../utils'
import CycleDiagram from './CycleDiagram'
import TimedEventEditor from './TimedEventEditor'

export default function CycleSection() {
  const cycle = useSelector((state) => state.cycle)

  return (
    <div>
      <h2>מחזור</h2>
      <CycleDurationSelector />
      {cycle && (
        <>
          <TimedEventEditor cycle={cycle} />
          <CycleOffsetInput cycle={cycle} />
          <CycleDiagram cycle={cycle} />
        </>
      )}
    </div>
  )
}

function CycleDurationSelector() {
  const dispatch = useDispatch()
  const cycleDurationSuggestions = useSelector(selectCycleDurationSuggestions)
  if (cycleDurationSuggestions.length === 0) {
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
      {cycleDurationSuggestions.map((suggestion) => (
        <button
          key={suggestion.duration}
          onClick={() => dispatch(setCycleDuraration(suggestion.duration))}
        >
          {`${formatTimestamp(suggestion.duration)} (${
            suggestion.conflictCount
          } קונפליקטים)`}
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
        value={cycle.offset}
        onChange={(event) =>
          dispatch(setCycleOffset(event.target.valueAsNumber))
        }
      />
    </div>
  )
}
