import React from 'react'
import { Cycle } from '../reducer'
import SimulationGraph from './SimulationGraph'

export default function SimulationVisualization({ cycle }: { cycle: Cycle }) {
  return (
    <div>
      <SimulationGraph cycle={cycle} />
    </div>
  )
}
