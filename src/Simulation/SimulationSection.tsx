import { Heading, HStack } from '@chakra-ui/layout'
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react'
import React from 'react'
import CrosswalkNumberIndicator from '../CrosswalkNumberIndicator'
import {
  crosswalkKey,
  selectCrosswalkIdsWithTrafficLights,
  setCrosswalkWalkTime,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import { sectionWidthCss } from '../styleUtils'
import JourneyCrosswalkIndexEditor from './JourneyCrosswalkIndexEditor'
import SimulationVisualization from './SimulationVisualization'

export default function SimulationSection() {
  const cycle = useSelector((state) => state.cycle)
  return (
    <>
      <div
        css={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div css={sectionWidthCss}>
          <Heading as='h2' size='lg'>
            סימולציה
          </Heading>
          <WalkingTimes />
        </div>
        {cycle && (
          <div
            css={{
              marginTop: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <JourneyCrosswalkIndexEditor css={sectionWidthCss} />
            <SimulationVisualization cycle={cycle} />
          </div>
        )}
      </div>
    </>
  )
}

function WalkingTimes() {
  const dispatch = useDispatch()
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)
  const walkTimes = useSelector((state) => state.walkTimes)

  return (
    <div>
      <Heading as='h3' size='md'>
        זמני הליכה (בשניות)
      </Heading>
      <HStack spacing='40px' shouldWrapChildren css={sectionWidthCss}>
        {crosswalkIds.map((id, index) => (
          <HStack key={crosswalkKey(id)}>
            <CrosswalkNumberIndicator
              number={index + 1}
              id={id}
              withLegs={false}
            />
            <NumberInput
              css={{ width: '100px' }}
              size='sm'
              min={0}
              value={walkTimes[crosswalkKey(id)] ?? 0}
              onChange={(_, value) =>
                dispatch(
                  setCrosswalkWalkTime({
                    crosswalkKey: crosswalkKey(id),
                    duration: value,
                  }),
                )
              }
            >
              <NumberInputField css={{ direction: 'ltr' }} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
        ))}
      </HStack>
    </div>
  )
}
