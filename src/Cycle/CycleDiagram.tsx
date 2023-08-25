import { Button, Radio, RadioGroup, Stack } from '@chakra-ui/react'
import React, { useMemo, useState } from 'react'
import CrosswalkNumberIndicator from '../CrosswalkNumberIndicator'
import {
  selectCanonicalCycleSegments,
  selectCrosswalkIdsWithTrafficLights,
} from '../reducer'
import { crosswalkKey, Cycle } from '../state'
import { useSelector } from '../store'
import { useColorColors } from '../styleUtils'
import { cutSegmentsToFit, Segment } from './timedEvents'

export default function CycleDiagram({
  cycle,
  className,
}: {
  cycle: Cycle
  className?: string
}) {
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)
  const canonicalSegments = useSelector(selectCanonicalCycleSegments)

  const [speed, setSpeed] = useState(1)

  return (
    <div
      className={className}
      css={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '10px',
        direction: 'ltr',
      }}
    >
      {crosswalkIds.map((crosswalkId, index) => (
        <React.Fragment key={crosswalkKey(crosswalkId)}>
          <CrosswalkNumberIndicator id={crosswalkId} number={index + 1} />
          <DiagramTrack
            crosswalkIndex={index}
            cycle={cycle}
            canonicalSegments={
              canonicalSegments.get(crosswalkKey(crosswalkId)) ?? null
            }
          />
        </React.Fragment>
      ))}
      <div css={{ gridColumn: 2 }}>
        <Button>play</Button>
        <SpeedControl speed={speed} setSpeed={setSpeed} />
      </div>
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
  const colorColors = useColorColors()
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

function SpeedControl({
  speed,
  setSpeed,
}: {
  speed: number
  setSpeed: (value: number) => void
}) {
  return (
    <RadioGroup
      onChange={(stringValue) => setSpeed(+stringValue)}
      value={speed.toString()}
    >
      <Stack direction='row'>
        <Radio value='1'>x1</Radio>
        <Radio value='2'>x2</Radio>
        <Radio value='4'>x4</Radio>
      </Stack>
    </RadioGroup>
  )
}
