import {
  Color,
  CrosswalkId,
  crosswalkKey,
  Cycle,
  selectCrosswalkIds,
  selectCrosswalkTransitions,
  setCycleOffset,
  Transition,
} from './reducer'
import { useDispatch, useSelector } from './store'
import { colorColors } from './TimelineEditor'
import { groupBy, mod } from './utils'

export default function CycleDiagram() {
  const cycle = useSelector((state) => state.cycle)
  const crosswalkIds = useSelector(selectCrosswalkIds)
  if (!cycle) {
    return null
  }
  return (
    <div>
      <h2>מחזור</h2>
      <CycleOffsetInput cycle={cycle} />
      <div>
        {crosswalkIds.map((crosswalkId, index) => (
          <DiagramTrack
            key={crosswalkKey(crosswalkId)}
            crosswalkId={crosswalkId}
            crosswalkIndex={index}
            cycle={cycle}
          />
        ))}
      </div>
    </div>
  )
}

function CycleOffsetInput({ cycle }: { cycle: Cycle }) {
  const dispatch = useDispatch()

  return (
    <div>
      <label htmlFor='cycle-offset-input'>
        אני לא זוכר איך אומרים אופסט בעברית:
      </label>
      <input
        id='cycle-offset-input'
        type='number'
        value={cycle.recordingOffset}
        onChange={(event) =>
          dispatch(setCycleOffset(event.target.valueAsNumber))
        }
      />
    </div>
  )
}

function DiagramTrack({
  crosswalkId,
  crosswalkIndex,
  cycle,
}: {
  crosswalkId: CrosswalkId
  crosswalkIndex: number
  cycle: Cycle
}) {
  const transitions = useSelector((state) =>
    selectCrosswalkTransitions(state, crosswalkId),
  )
  const trackTimings = timings(transitions, cycle)
  if (!trackTimings) {
    return <div>no data</div>
  }

  const { red, green } = trackTimings
  const isRedFirst = red < green
  const [t0, t3] = [0, cycle.duration]
  const [t1, t2, c0, c1, c2]: [number, number, Color, Color, Color] = isRedFirst
    ? [red, green, 'green', 'red', 'green']
    : [green, red, 'red', 'green', 'red']

  return (
    <div
      style={{
        position: 'relative',
        width: '500px',
        height: '30px',
        border: '1px solid black',
        margin: '5px 0',
      }}
    >
      <TrackSegment
        color={c0}
        offset={t0}
        duration={t1 - t0}
        cycleDuratiton={cycle.duration}
      />
      <TrackSegment
        color={c1}
        offset={t1}
        duration={t2 - t1}
        cycleDuratiton={cycle.duration}
      />
      <TrackSegment
        color={c2}
        offset={t2}
        duration={t3 - t2}
        cycleDuratiton={cycle.duration}
      />
    </div>
  )
}

function TrackSegment({
  color,
  offset,
  duration,
  cycleDuratiton,
}: {
  color: Color
  offset: number
  duration: number
  cycleDuratiton: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: `${(offset / cycleDuratiton) * 100}%`,
        width: `${(duration / cycleDuratiton) * 100}%`,
        height: '100%',
        background: colorColors[color],
      }}
    ></div>
  )
}

function timings(
  transitions: Transition[],
  cycle: Cycle,
): { red: number; green: number } | null {
  const transitionGroups = groupBy(
    transitions,
    (transition) => transition.toColor,
  )
  const timingMap = new Map(
    Array.from(transitionGroups.entries()).map(
      ([color, crosswalkTransitions]) => {
        const possibleTimings = crosswalkTransitions.map((transition) =>
          mod(transition.timestamp - cycle.recordingOffset, cycle.duration),
        )
        // TODO: fancy calculation
        return [color, possibleTimings[0]]
      },
    ),
  )
  const { red, green } = Object.fromEntries(timingMap.entries())
  if (red !== null && green !== null) {
    return { red, green }
  } else {
    return null
  }
}
