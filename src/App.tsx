import { HStack, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import CycleDiagram from './Cycle/CycleDiagram'
import CycleSection from './Cycle/CycleSection'
import DebugSection from './DebugSection'
import Header from './Header'
import JunctionSection from './Junction/JunctionSection'
import { JunctionSvg } from './Junction/JunctionSvg'
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
    <VStack padding='20px' spacing='40px' align='center'>
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
          <HStack
            wrap='wrap'
            align='stretch'
            justify='center'
            spacing='40px'
            css={sectionWidthCss}
          >
            <JunctionSvg inEditMode={inEditMode} />
            {cycle && (
              <CycleDiagram
                cycle={cycle}
                css={{ minWidth: '300px', flexGrow: 1, alignSelf: 'center' }}
              />
            )}
          </HStack>
          {cycle && <JourneyCrosswalkIndexEditor css={sectionWidthCss} />}
          {cycle && <SimulationVisualization cycle={cycle} />}
        </>
      )}
      <DebugSection />
    </VStack>
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
