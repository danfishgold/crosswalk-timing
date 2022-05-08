import React from 'react'
import CycleSection from './Cycle/CycleSection'
import JunctionSection from './Junction/JunctionSection'
import RecordingSection from './Recording/RecordingSection'
import { toggleEditMode } from './reducer'
import SimulationSection from './Simulation/SimulationSection'
import StateClipboardButtons from './StateClipboardButtons'
import { decodeState, encodeState } from './stateCoding'
import { useDispatch, useSelector } from './store'

function App() {
  const state = useSelector((state) => state)
  const inEditMode = useSelector((state) => state.inEditMode)
  return (
    <div>
      <p>
        <strong>נוהל בטא</strong>: אם תנסו לשבור זה ישבר. אם תנסו להשתמש בזה
        בטלפון זה כנראה גם ישבר
      </p>
      <EditModeToggle />
      <JunctionSection />
      {inEditMode && <RecordingSection />}
      <CycleSection />
      <SimulationSection />
      <h2>שטויות</h2>
      <StateClipboardButtons />
      <p>{encodeState(state)}</p>
      <p>{JSON.stringify(decodeState(encodeState(state)))}</p>
    </div>
  )
}

function EditModeToggle() {
  const dispatch = useDispatch()
  const inEditMode = useSelector((state) => state.inEditMode)
  return (
    <div>
      <button onClick={() => dispatch(toggleEditMode())}>
        {inEditMode ? 'שמירה' : 'עריכה'}
      </button>
      {inEditMode && (
        <button
          onClick={() => {
            if (window.confirm('בטוח?')) {
              dispatch(resetState())
            }
          }}
        >
          טאבולה ראסה
        </button>
      )}
    </div>
  )
}

export default App
