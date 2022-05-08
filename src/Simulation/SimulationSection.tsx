import React, { useMemo, useState } from 'react'
import CrosswalkNumberIndicator from '../CrosswalkNumberIndicator'
import {
  crosswalkKey,
  selectCrosswalkIds,
  setCrosswalkWalkTime,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import JourneyCrosswalkIndexEditor from './JourneyCrosswalkIndexEditor'
import SimulationGraph from './SimulationGraph'

export default function SimulationSection() {
  const cycle = useSelector((state) => state.cycle)
  const inEditMode = useSelector((state) => state.inEditMode)

  const [crosswalkIndexes, setCrosswalkIndexes] = useState<number[] | null>(
    null,
  )
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const journeyCrosswalkIds = useMemo(() => {
    if (
      !crosswalkIndexes ||
      Math.min(...crosswalkIndexes) < 0 ||
      Math.max(...crosswalkIndexes) >= crosswalkIds.length
    ) {
      return []
    } else {
      return crosswalkIndexes.map((index) => crosswalkIds[index])
    }
  }, [crosswalkIds, crosswalkIndexes])

  return (
    <div>
      <h2>סימולציה</h2>
      {inEditMode && <WalkingTimes />}
      <JourneyCrosswalkIndexEditor setIndexes={setCrosswalkIndexes} />
      {cycle && (
        <SimulationGraph
          journeyCrosswalkIds={journeyCrosswalkIds}
          cycle={cycle}
        />
      )}
    </div>
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
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '10px',
          width: '100px',
          padding: '5px',
        }}
      >
        {crosswalkIds.map((id, index) => (
          <React.Fragment key={crosswalkKey(id)}>
            <CrosswalkNumberIndicator number={index + 1} highlight={null} />
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
