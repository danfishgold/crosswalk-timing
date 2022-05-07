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
import CrosswalkNumberIndicator from './../CrosswalkNumberIndicator'
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
      <CrosswalkNumberIndicator number={index + 1} highlight={highlight} />
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

  const onDeleteClick = () => {
    if (window.confirm('בטוח למחוק?')) {
      dispatch(deleteTransitionFromList(id))
    }
  }
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
      <button onClick={onDeleteClick}>מחיקה</button>
    </div>
  )
}