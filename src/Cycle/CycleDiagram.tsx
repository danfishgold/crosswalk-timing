import { useMemo } from 'react'
import {
  crosswalkKey,
  Cycle,
  selectCanonicalCycleSegments,
  selectCrosswalkIds,
} from '../reducer'
import { useSelector } from '../store'
import { colorColors } from '../utils'
import { cutSegmentsToFit, Segment } from './timedEvents'

export default function CycleDiagram({ cycle }: { cycle: Cycle }) {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const canonicalSegments = useSelector(selectCanonicalCycleSegments)

  return (
    <div>
      {crosswalkIds.map((crosswalkId, index) => (
        <DiagramTrack
          key={crosswalkKey(crosswalkId)}
          crosswalkIndex={index}
          cycle={cycle}
          canonicalSegments={
            canonicalSegments.get(crosswalkKey(crosswalkId)) ?? null
          }
        />
      ))}
    </div>
  )
}

function DiagramTrack({
  crosswalkIndex,
  cycle,
  canonicalSegments,
}: {
  crosswalkIndex: number
  cycle: Cycle
  canonicalSegments: Segment[] | null
}) {
  const segments = useMemo(
    () => canonicalSegments && cutSegmentsToFit(canonicalSegments, cycle),
    [canonicalSegments, cycle],
  )

  if (!segments) {
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
      {segments.map((segment, index) => (
        <TrackSegment
          key={index}
          segment={segment}
          cycleDuratiton={cycle.duration}
        />
      ))}
    </div>
  )
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
