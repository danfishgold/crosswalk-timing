import { CrosswalkId, Cycle, selectCrosswalkIds } from '../reducer'
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
    </div>
  )
}

export type Journey = {
  crosswalkIndexes: number[]
  crosswalkIds: CrosswalkId[]
  key: string
  color: string
}

const journeyColors = ['navy', 'darkorange']

function useJourneys(): Journey[] {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const inputJourneyIndexes = useSelector((state) => state.journeyIndexes)
  const journeyIndexes = isAsymmetric(inputJourneyIndexes)
    ? [inputJourneyIndexes, [...inputJourneyIndexes].reverse()]
    : [inputJourneyIndexes]

  const journeys = compact(
    journeyIndexes.map((indexes, journeyIndex) => {
      if (indexes.length === 0) {
        return null
      }
      try {
        const ids = indexes.map((index) => crosswalkId(index, crosswalkIds))
        const key = indexes.join('->')
        return {
          crosswalkIndexes: indexes,
          crosswalkIds: ids,
          key,
          color: journeyColors[mod(journeyIndex, journeyColors.length)],
        }
      } catch {
        return null
      }
    }),
  )

  return journeys
}

function isAsymmetric(indexes: number[]): boolean {
  const keys = indexes.join(',')
  const reverseKeys = [...indexes].reverse().join(',')
  return keys !== reverseKeys
}

function crosswalkId(index: number, crosswalkIds: CrosswalkId[]): CrosswalkId {
  if (index < 0 || index >= crosswalkIds.length) {
    throw new Error(`Crosswalk index (${index}) out of range`)
  }
  return crosswalkIds[index]
}
