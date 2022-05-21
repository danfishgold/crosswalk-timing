import {
  CrosswalkId,
  crosswalkKey,
  Cycle,
  selectCrosswalkIds,
  selectJourneyIndexes,
} from '../reducer'
import { useSelector } from '../store'
import { compact, mod } from '../utils'
import SimulationGraph from './SimulationGraph'
import SimulationLegend from './SimulationLegend'
import useJourneyDurations from './useJourneyDurations'

export default function SimulationVisualization({ cycle }: { cycle: Cycle }) {
  const journeys = useJourneys()
  const data = useJourneyDurations(cycle, journeys)
  return (
    <div>
      <SimulationGraph cycle={cycle} journeys={journeys} data={data} />
      {journeys.length > 0 && (
        <SimulationLegend journeys={journeys} data={data} />
      )}
      <SimulationDisclamer />
    </div>
  )
}

function SimulationDisclamer() {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const walkTimes = useSelector((state) => state.walkTimes)

  const times = crosswalkIds
    .map(
      (id, index) => `${walkTimes[crosswalkKey(id)]} שניות במעבר ${index + 1}`,
    )
    .join(', ')

  return (
    <div style={{ fontSize: '0.8rem', marginTop: '30px' }}>
      *בהנחה של משך החציה הבא לכל מעבר חציה: {times}
    </div>
  )
}

export type Journey = {
  crosswalkIndexes: number[]
  crosswalkIds: CrosswalkId[]
  key: string
  title: string
  color: string
}

const journeyColors = ['navy', 'darkorange', 'purple', 'brown', 'darkgreen']

function useJourneys(): Journey[] {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const journeyIndexes = useSelector(selectJourneyIndexes)

  const journeys = compact(
    journeyIndexes.map((indexes, journeyIndex) => {
      if (indexes.length === 0) {
        return null
      }
      try {
        const ids = indexes.map((index) =>
          crosswalkIdAtIndex(index, crosswalkIds),
        )
        const key = `${indexes.join('->')} (${journeyIndex + 1})`
        const title = indexes.map((index) => index + 1).join(' → ')
        return {
          crosswalkIndexes: indexes,
          crosswalkIds: ids,
          key,
          title,
          color: journeyColors[mod(journeyIndex, journeyColors.length)],
        }
      } catch {
        return null
      }
    }),
  )

  return journeys
}

function crosswalkIdAtIndex(
  index: number,
  crosswalkIds: CrosswalkId[],
): CrosswalkId {
  if (index < 0 || index >= crosswalkIds.length) {
    throw new Error(`Crosswalk index (${index}) out of range`)
  }
  return crosswalkIds[index]
}
