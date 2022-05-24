import React, { useEffect } from 'react'
import CycleDiagram from './Cycle/CycleDiagram'
import CycleSection from './Cycle/CycleSection'
import DebugSection from './DebugSection'
import Header from './Header'
import JunctionSection from './Junction/JunctionSection'
import { JunctionSvg } from './Junction/JunctionSvg'
import JunctionSvgAndCompanionWrapper from './Junction/JunctionSvgAndCompanionWrapper'
import RecordingSection from './Recording/RecordingSection'
import { replaceEntireState } from './reducer'
import JourneyCrosswalkIndexEditor from './Simulation/JourneyCrosswalkIndexEditor'
import SimulationSection from './Simulation/SimulationSection'
import SimulationVisualization from './Simulation/SimulationVisualization'
import { decodeState, encodeState } from './stateCoding'
import { useDispatch, useSelector } from './store'
import { sectionWidthCss } from './styleUtils'

function App() {
  const inEditMode = useSelector((state) => state.inEditMode)
  const cycle = useSelector((state) => state.cycle)
  useStateUrlSync()

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        width: 'calc(100% - 40px)',
        gap: '40px',
      }}
    >
      <Header />
      {inEditMode ? (
        <>
          <JunctionSection />
          <RecordingSection />
          <CycleSection />
          <SimulationSection />
        </>
      ) : (
        <>
          <JunctionSvgAndCompanionWrapper>
            <JunctionSvg inEditMode={inEditMode} onLegClick={() => {}} />
            {cycle && (
              <CycleDiagram
                cycle={cycle}
                css={{ minWidth: '300px', flexGrow: 1, alignSelf: 'center' }}
              />
            )}
          </JunctionSvgAndCompanionWrapper>
          {cycle && <JourneyCrosswalkIndexEditor css={sectionWidthCss} />}
          {cycle && <SimulationVisualization cycle={cycle} />}
        </>
      )}
      <DebugSection />
    </div>
  )
}

function useStateUrlSync() {
  const dispatch = useDispatch()
  const encodedState = useSelector(encodeState)
  const urlFragment = `#${encodedState}`

  useEffect(() => {
    if (window.location.hash === urlFragment) {
      return
    }
    const stateString = window.location.hash.replace(/^#/, '')
    const preloadedState = decodeState(stateString)
    if (preloadedState) {
      dispatch(replaceEntireState(preloadedState))
    }
  }, [])

  useEffect(() => {
    window.history.replaceState(null, '', urlFragment)
  }, [encodedState])
}

export default App
