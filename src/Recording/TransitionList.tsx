import React from 'react'
import {
  CrosswalkId,
  crosswalkKey,
  deleteTransitionFromList,
  Highlight,
  selectCrosswalkHighlightColors,
  selectCrosswalkIds,
  selectCrosswalkTransitionsAndIds,
  updateTransitionInList,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import { highlightColors } from '../utils'
import TransitionFormElements from './TransitionFormElements'

export default function TransitionList() {
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
