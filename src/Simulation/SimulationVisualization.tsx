import { ThemingProps } from '@chakra-ui/system'
import {
  CrosswalkId,
  Cycle,
  selectCrosswalkIdsWithTrafficLights,
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
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
        width: '100%',
      }}
    >
      <SimulationGraph
        cycle={cycle}
        journeys={journeys}
        data={data}
        css={{
          height: '400px',
          minWidth: '350px',
          flexBasis: '400px',
          maxWidth: '700px',
          flexShrink: 1,
          flexGrow: 1,
        }}
      />
      {journeys.length > 0 && (
        <SimulationLegend
          journeys={journeys}
          data={data}
          css={{
            justifySelf: 'flex-start',
            flexGrow: 0,
          }}
        />
      )}
    </div>
  )
}

export type Journey = {
  crosswalkIndexes: number[]
  crosswalkIds: CrosswalkId[]
  key: string
  title: string
  color: ThemingProps['colorScheme']
}

const journeyColors: ThemingProps['colorScheme'][] = [
  'blue',
  'purple',
  'teal',
  'pink',
  'orange',
  'red',
]

function useJourneys(): Journey[] {
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)
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
