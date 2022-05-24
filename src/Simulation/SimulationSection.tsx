import { Heading } from '@chakra-ui/layout'
import React from 'react'
import CrosswalkNumberIndicator from '../CrosswalkNumberIndicator'
import {
  crosswalkKey,
  selectCrosswalkIds,
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
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const walkTimes = useSelector((state) => state.walkTimes)

  return (
    <div>
      <Heading as='h3' size='md'>
        זמני הליכה (בשניות)
      </Heading>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr auto 1fr',
          gap: '10px',
          width: '100px',
          padding: '5px',
        }}
      >
        {crosswalkIds.map((id, index) => (
          <React.Fragment key={crosswalkKey(id)}>
            <CrosswalkNumberIndicator
              number={index + 1}
              highlight={null}
              withLegs={false}
            />
            <input
              type='number'
              css={{ maxWidth: '50px', marginLeft: '20px' }}
              min='0'
              value={walkTimes[crosswalkKey(id)] ?? 0}
              onChange={(event) =>
                dispatch(
                  setCrosswalkWalkTime({
                    crosswalkKey: crosswalkKey(id),
                    duration: event.target.valueAsNumber,
                  }),
                )
              }
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
