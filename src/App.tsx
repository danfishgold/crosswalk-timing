import { HStack, VStack } from '@chakra-ui/react'
import { CycleDiagram } from './Cycle/CycleDiagram'
import { CycleSection } from './Cycle/CycleSection'
import { DebugSection } from './DebugSection'
import { Header } from './Header'
import { JunctionSection } from './Junction/JunctionSection'
import { JunctionSvg } from './Junction/JunctionSvg'
import { TimelineEditor as RecordingSection } from './Recording/RecordingSection'
import { JourneyCrosswalkIndexEditor } from './Simulation/JourneyCrosswalkIndexEditor'
import { SimulationSection } from './Simulation/SimulationSection'
import { SimulationVisualization } from './Simulation/SimulationVisualization'
import { useSelector } from './store'
import { sectionWidthCss } from './styleUtils'

function App() {
  const inEditMode = useSelector((state) => state.inEditMode)
  const cycle = useSelector((state) => state.cycle)

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
            dir='ltr'
            css={sectionWidthCss}
          >
            {cycle && (
              <CycleDiagram
                cycle={cycle}
                css={{ minWidth: '300px', flexGrow: 1, alignSelf: 'center' }}
              />
            )}
            <JunctionSvg inEditMode={inEditMode} />
          </HStack>
          {cycle && <JourneyCrosswalkIndexEditor css={sectionWidthCss} />}
          {cycle && <SimulationVisualization cycle={cycle} />}
        </>
      )}
      <DebugSection />
    </VStack>
  )
}

export default App
