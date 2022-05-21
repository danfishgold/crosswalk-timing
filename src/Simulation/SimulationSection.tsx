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
      <div css={sectionWidthCss}>
        <h2>סימולציה</h2>
        <WalkingTimes />
        {cycle && <JourneyCrosswalkIndexEditor />}
      </div>
      {cycle && <SimulationVisualization cycle={cycle} />}
    </>
  )
}

function WalkingTimes() {
  const dispatch = useDispatch()
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const walkTimes = useSelector((state) => state.walkTimes)

  return (
    <div>
      <h3>זמני הליכה</h3>
      <p>(בשניות)</p>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
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
