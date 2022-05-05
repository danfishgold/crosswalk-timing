import React from 'react'
import CycleSection from './Cycle/CycleSection'
import JunctionSection from './Junction/JunctionSection'
import RecordingSection from './Recording/RecordingSection'
import { toggleEditMode } from './reducer'
import { useDispatch, useSelector } from './store'

function App() {
  return (
    <div>
      <p>
        <strong>נוהל בטא</strong>: אם תנסו לשבור זה ישבר. אם תנסו להשתמש בזה
        בטלפון זה כנראה גם ישבר
      </p>
      <EditModeToggle />
      <JunctionSection />
      <RecordingSection />
      <CycleSection />
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
