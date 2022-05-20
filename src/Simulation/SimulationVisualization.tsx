import { Cycle } from '../reducer'
import SimulationGraph from './SimulationGraph'
import SimulationLegend from './SimulationLegend'
import useJourneyDurations from './useJourneyDurations'

export default function SimulationVisualization({ cycle }: { cycle: Cycle }) {
  const { data, hasAsymmetricJourney } = useJourneyDurations(cycle)
  return (
    <div>
      <SimulationGraph
        cycle={cycle}
        data={data}
        hasAsymmetricJourney={hasAsymmetricJourney}
      />
      <SimulationLegend />
    </div>
  )
}
