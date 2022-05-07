import {
  Color,
  CrosswalkId,
  crosswalkKey,
  Cycle,
  selectCrosswalkIds,
} from '../reducer'
import { useSelector } from '../store'
import { colorColors, compact, mod, pairs, sortBy } from '../utils'
import { timedEventKey } from './timedEvents'

export default function CycleDiagram({ cycle }: { cycle: Cycle }) {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const events = useSelector((state) => state.eventTimestamps)

  return (
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
  const reds =
    useSelector(
      (state) => state.eventTimestamps[timedEventKey(crosswalkId, 'red')],
    ) ?? []
  const greens =
    useSelector(
      (state) => state.eventTimestamps[timedEventKey(crosswalkId, 'green')],
    ) ?? []
  const trackSegments = calculateTrackSegments(reds, greens, cycle)
  if (!trackSegments) {
    return <div>no data</div>
  }

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
      {trackSegments.map((segment, index) => (
        <TrackSegment
          key={index}
          segment={segment}
          cycleDuratiton={cycle.duration}
        />
      ))}
    </div>
  )
}

type Segment = { color: Color; offset: number; duration: number }

function calculateTrackSegments(
  reds: number[],
  greens: number[],
  cycle: Cycle,
): Segment[] | null {
  const sortedEvents: { timestamp: number; color: Color }[] = sortBy(
    [
      ...reds.map((timestamp) => ({ timestamp, color: 'red' as const })),
      ...greens.map((timestamp) => ({ timestamp, color: 'green' as const })),
    ].map((event) => ({
      ...event,
      timestamp: mod(event.timestamp - cycle.offset, cycle.duration),
    })),
    (event) => event.timestamp,
  )
  const eventCount = sortedEvents.length
  if (eventCount < 2) {
    return null
  }

  const eventsWithExplicitBorderEvents = compact([
    sortedEvents[0].timestamp === 0
      ? null
      : { timestamp: 0, color: sortedEvents[1].color },
    ...sortedEvents,
    sortedEvents[eventCount - 1].timestamp === cycle.duration
      ? null
      : {
          timestamp: cycle.duration,
          color: sortedEvents[eventCount - 2].color,
        },
  ])

  const eventPairs = pairs(eventsWithExplicitBorderEvents)

  if (
    eventPairs.length === 0 ||
    eventPairs.some(([event1, event2]) => event1.color === event2.color)
  ) {
    return null
  }

  return eventPairs.map(([event1, event2]) => ({
    color: event1.color,
    offset: event1.timestamp,
    duration: event2.timestamp - event1.timestamp,
  }))
}

function TrackSegment({
  segment,
  cycleDuratiton,
}: {
  segment: Segment
  cycleDuratiton: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: `${(segment.offset / cycleDuratiton) * 100}%`,
        width: `${(segment.duration / cycleDuratiton) * 100}%`,
        height: '100%',
        background: colorColors[segment.color],
      }}
    ></div>
  )
}
