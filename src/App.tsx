import React from 'react'
import CycleDiagram from './Cycle/CycleDiagram'
import CycleSection from './Cycle/CycleSection'
import JunctionSection from './Junction/JunctionSection'
import { JunctionSvg } from './Junction/JunctionSvg'
import RecordingSection from './Recording/RecordingSection'
import { resetState, setJunctionTitle, toggleEditMode } from './reducer'
import SimulationGraph from './Simulation/SimulationGraph'
import SimulationSection from './Simulation/SimulationSection'
import StateClipboardButtons from './StateClipboardButtons'
import { decodeState, encodeState } from './stateCoding'
import { useDispatch, useSelector } from './store'

function App() {
  const state = useSelector((state) => state)
  const inEditMode = useSelector((state) => state.inEditMode)
  const cycle = useSelector((state) => state.cycle)

  return (
    <div>
      <p>
        <strong>נוהל בטא</strong>: אם תנסו לשבור זה ישבר. אם תנסו להשתמש בזה
        בטלפון זה כנראה גם ישבר
      </p>
      <EditModeToggle />
      <JunctionTitle />

      {inEditMode ? (
        <>
          <JunctionSection />
          <RecordingSection />
          <CycleSection />
          <SimulationSection />
        </>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            <JunctionSvg inEditMode={inEditMode} onLegClick={() => {}} />
            <div style={{ width: '50%', maxWidth: '500px' }}>
              {cycle && <CycleDiagram cycle={cycle} />}
            </div>
          </div>
          <br />
          <br />
          <br />
          {cycle && <SimulationGraph cycle={cycle} />}
        </>
      )}

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

function JunctionTitle() {
  const dispatch = useDispatch()
  const inEditMode = useSelector((state) => state.inEditMode)
  const junctionTitle = useSelector((state) => state.junctionTitle)

  if (inEditMode) {
    return (
      <div>
        <label>שם הצומת</label>
        <input
          value={junctionTitle}
          onChange={(event) => dispatch(setJunctionTitle(event.target.value))}
        />
      </div>
    )
  } else if (junctionTitle) {
    return <h1 style={{ textAlign: 'center' }}>{junctionTitle}</h1>
  } else {
    return null
  }
}
