import React, {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import JunctionBuilder, { Legs, range, setArrayItem } from './JunctionBuilder'
import Popover from './Popover'

function App() {
  const [durationInputValue, setDurationInputValue, duration] =
    useDurationInput()
  const [legs, setLegs] = useState<Legs>([
    { crosswalk: false, island: true },
    null,
    { crosswalk: true, island: true },
    { crosswalk: true, island: false },
  ])
  const [tracks, setTracks] = useState<Track[]>(
    range(trackCount(legs)).map(() => ({
      transitions: [],
    })),
  )

  useEffect(() => {
    setTracks(
      range(trackCount(legs)).map(() => ({
        transitions: [],
      })),
    )
  }, [legs])

  const addTransition = (transition: Transition, trackIndex: number) => {
    const newTrack = {
      ...tracks[trackIndex],
      transitions: [...tracks[trackIndex].transitions, transition],
    }
    setTracks(setArrayItem(tracks, trackIndex, newTrack))
  }

  return (
    <div>
      <JunctionBuilder legs={legs} setLegs={setLegs} />
      <hr />
      <DurationInput
        value={durationInputValue}
        setValue={setDurationInputValue}
      />
      {duration ? (
        <TimelineEditor
          duration={duration}
          tracks={tracks}
          addTransition={addTransition}
        />
      ) : (
        <BlankTimelineEditor tracks={tracks} />
      )}
    </div>
  )
}

function DurationInput({
  value,
  setValue,
}: {
  value: string
  setValue: Dispatch<SetStateAction<string>>
}) {
  return (
    <div>
      <label htmlFor='duration-input'>משך ההקלטה:</label>
      <input
        id='duration-input'
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}

type Transition = { to: Color; timestamp: number }

type Color = 'red' | 'green'

type Track = {
  transitions: Transition[]
}

function TimelineEditor({
  duration,
  tracks,
  addTransition,
}: {
  duration: number
  tracks: Track[]
  addTransition: (transition: Transition, trackIndex: number) => void
}) {
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(
    null,
  )
  const [transitionCandidate, setTransitionCandidate] = useState<{
    trackIndex: number
    timestamp: number
    x: number
    y: number
  } | null>(null)

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (transitionCandidate) {
      return
    }
    const boundingRect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - boundingRect.x
    const timestamp = Math.round((x / boundingRect.width) * duration)
    setSelectedTimestamp(timestamp)
  }

  const onMouseLeave = () => {
    if (transitionCandidate) {
      return
    }
    setSelectedTimestamp(null)
  }

  const onTrackClick = (
    trackIndex: number,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (!selectedTimestamp) {
      return
    }
    setTransitionCandidate({
      trackIndex,
      timestamp: selectedTimestamp,
      x: event.clientX,
      y: event.clientY,
    })
  }

  const onConfirmTransition = (color: Color) => {
    if (!transitionCandidate) {
      return
    }
    const transition: Transition = {
      timestamp: transitionCandidate.timestamp,
      to: color,
    }
    addTransition(transition, transitionCandidate.trackIndex)
    setTransitionCandidate(null)
    setSelectedTimestamp(null)
  }

  return (
    <div
      style={{ position: 'relative' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {tracks.map((track, index) => (
        <div
          onClick={(event) => onTrackClick(index, event)}
          key={index}
          style={{
            width: '100%',
            height: '30px',
            margin: '5px 0',
            border: '1px solid black',
            position: 'relative',
          }}
        >
          {track.transitions.map((transition, index) => (
            <TrackTransition
              key={index}
              transition={transition}
              duration={duration}
            />
          ))}
        </div>
      ))}
      {selectedTimestamp && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${(selectedTimestamp / duration) * 100}%`,
            height: '100%',
            width: '1px',
            background: 'black',
            pointerEvents: 'none',
          }}
        ></div>
      )}
      {selectedTimestamp && (
        <div
          style={{
            marginLeft: `${(selectedTimestamp / duration) * 100}%`,
            background: 'white',
          }}
        >
          {formatTimestamp(selectedTimestamp)}
        </div>
      )}
      {transitionCandidate && (
        <Popover x={transitionCandidate.x} y={transitionCandidate.y}>
          <button onClick={() => onConfirmTransition('green')}>
            נהיה ירוק
          </button>
          <button onClick={() => onConfirmTransition('red')}>נהיה אדום</button>
          <button onClick={() => setTransitionCandidate(null)}>חזל״ש</button>
        </Popover>
      )}
    </div>
  )
}

function TrackTransition({
  transition,
  duration,
}: {
  transition: Transition
  duration: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: `${(transition.timestamp / duration) * 100}%`,
        width: '10px',
        height: '100%',
        background:
          transition.to === 'green'
            ? 'linear-gradient(to right, rgba(255, 0,0 ,0) 0% , rgba(255,0,0, 1) 50%, rgba(0, 255, 0, 1) 50%,  rgba(0,255,0,0) 100%'
            : 'linear-gradient(to right, rgba(0, 255,0 ,0) 0% , rgba(0,255,0, 1) 50%, rgba(255,0,0, 1) 50%,  rgba(255,0,0,0) 100%',
      }}
    ></div>
  )
}

function TrackSegment({
  color,
  duration,
  totalDuration,
}: {
  color: 'green' | 'red' | 'unknown'
  duration: number
  totalDuration: number
}) {
  return (
    <div
      style={{
        width: `${(duration / totalDuration) * 100}%`,
        height: '100%',
        background: color === 'unknown' ? 'gray' : color,
      }}
    ></div>
  )
}

function BlankTimelineEditor({ tracks }: { tracks: Track[] }) {
  return (
    <div>
      {range(tracks.length).map((index) => (
        <div
          key={index}
          style={{ width: '100%', height: '30px', margin: '5px' }}
        >
          <TrackSegment color='unknown' duration={1} totalDuration={1} />
        </div>
      ))}
    </div>
  )
}

function useDurationInput(): [
  string,
  Dispatch<SetStateAction<string>>,
  number | null,
] {
  const [value, setValue] = useState('6:30')

  const match = value.match(/^(\d+):(\d\d)$/)
  const duration = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : null

  return [value, setValue, duration]
}
export default App

function trackCount(legs: Legs): number {
  let count = 0
  for (const leg of legs) {
    if (leg?.crosswalk) {
      count += leg.island ? 2 : 1
    }
  }
  return count
}

type Segment = {
  start: number
  duration: number
  color: 'green' | 'red' | 'unknown'
}

function formatTimestamp(timestamp: number): string {
  const minutes = Math.floor(timestamp / 60)
  const seconds = Math.round(timestamp % 60)
  const paddedSeconds = seconds.toString().length < 2 ? '0' + seconds : seconds
  return `${minutes}:${paddedSeconds}`
}
