import React from 'react'
import CycleSection from './Cycle/CycleSection'
import JunctionSection from './Junction/JunctionSection'
import RecordingSection from './Recording/RecordingSection'
import { toggleEditMode } from './reducer'
import SimulationSection from './Simulation/SimulationSection'
import { decodeState, encodeState } from './stateCoding'
import { useDispatch, useSelector } from './store'

function App() {
  const state = useSelector((state) => state)
  return (
    <div>
      <p>
        <strong>נוהל בטא</strong>: אם תנסו לשבור זה ישבר. אם תנסו להשתמש בזה
        בטלפון זה כנראה גם ישבר
      </p>
      <p>{encodeState(state)}</p>
      <p>{JSON.stringify(decodeState(encodeState(state)))}</p>
      <EditModeToggle />
      <JunctionSection />
      <RecordingSection />
      <CycleSection />
      <SimulationSection />
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
    </div>
  )
}

export default App
