import React, { useMemo } from 'react'
import CrosswalkNumberIndicator from '../CrosswalkNumberIndicator'
import {
  crosswalkKey,
  Cycle,
  selectCanonicalCycleSegments,
  selectCrosswalkIds,
} from '../reducer'
import { useSelector } from '../store'
import { colorColors } from '../styleUtils'
import { cutSegmentsToFit, Segment } from './timedEvents'

export default function CycleDiagram({
  cycle,
  className,
}: {
  cycle: Cycle
  className?: string
}) {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const canonicalSegments = useSelector(selectCanonicalCycleSegments)

  return (
    <div
      className={className}
      css={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px' }}
    >
      {crosswalkIds.map((crosswalkId, index) => (
        <React.Fragment key={crosswalkKey(crosswalkId)}>
          <CrosswalkNumberIndicator
            number={index + 1}
            highlight={null}
            withLegs={false}
          />
          <DiagramTrack
            crosswalkIndex={index}
            cycle={cycle}
            canonicalSegments={
              canonicalSegments.get(crosswalkKey(crosswalkId)) ?? null
            }
          />
        </React.Fragment>
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
      css={{
        position: 'relative',
        height: '30px',
        border: '1px solid black',
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
      css={{
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
