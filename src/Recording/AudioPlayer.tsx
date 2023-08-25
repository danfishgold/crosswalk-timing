import { RefObject, useEffect, useRef, useState } from 'react'
import WaveSurfer, { WaveSurferOptions } from 'wavesurfer.js'
import Hover from 'wavesurfer.js/dist/plugins/hover'
import Regions from 'wavesurfer.js/dist/plugins/regions'
import Timeline from 'wavesurfer.js/dist/plugins/timeline'
import { Transition } from '../state'
import { TimelineTimestamp } from './RecordingSection'

const regionsPlugin = Regions.create()

const options = {
  height: 100,
  width: '100%',
  waveColor: 'rgb(170, 170, 170)',
  progressColor: 'rgb(0, 0, 0)',
  plugins: [
    Timeline.create(),
    Hover.create({
      lineColor: '#ff0000',
      lineWidth: 2,
      labelBackground: '#555',
      labelColor: '#fff',
      labelSize: '11px',
    }),
    regionsPlugin,
  ],
}

export function AudioPlayer({
  url,
  timestamp,
  setTimestamp,
  isPlaying,
  setIsPlaying,
  transitions,
}: {
  url: string
  timestamp: TimelineTimestamp
  setTimestamp: (timestamp: TimelineTimestamp) => void
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
  transitions: Record<number, Transition[]>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useWavesurfer(containerRef, options, url)

  useEffect(() => {
    if (!wavesurfer) {
      return
    }

    const subscriptions = [
      wavesurfer.on('play', () => setIsPlaying(true)),
      wavesurfer.on('pause', () => setIsPlaying(false)),
      wavesurfer.on('timeupdate', (currentTime) =>
        setTimestamp({ value: currentTime, fromWaveSurfer: true }),
      ),
    ]

    return () => {
      subscriptions.forEach((unsub) => unsub())
    }
  }, [wavesurfer])

  useEffect(() => {
    if (!wavesurfer || timestamp.fromWaveSurfer) {
      return
    }
    wavesurfer.setTime(timestamp.value)
  }, [timestamp])

  useEffect(() => {
    if (!wavesurfer || wavesurfer.isPlaying() === isPlaying) {
      return
    }
    if (isPlaying) {
      wavesurfer.play()
    } else {
      wavesurfer.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    regionsPlugin.clearRegions()
    for (const [crosswalkIndex, transitionsForCrosswalk] of Object.entries(
      transitions,
    )) {
      for (const transition of transitionsForCrosswalk) {
        regionsPlugin.addRegion({
          start: transition.timestamp,
          content: transitionMarker(transition, +crosswalkIndex),
          id: transition.toColor,
        })
      }
    }
  }, [transitions])

  return <div id='waveform' ref={containerRef} css={{ width: '100%' }} />
}

function useWavesurfer(
  containerRef: RefObject<HTMLDivElement>,
  options: Omit<WaveSurferOptions, 'container' | 'url'>,
  url: string,
) {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    const ws = WaveSurfer.create({
      ...options,
      container: containerRef.current,
      url,
    })
    setWavesurfer(ws)

    return () => {
      ws.destroy()
    }
  }, [containerRef, options, url])

  return wavesurfer
}

function transitionMarker(
  transition: Transition,
  crosswalkIndex: number,
): HTMLElement {
  const div = document.createElement('div')
  const innerDiv = document.createElement('div')
  div.appendChild(innerDiv)
  innerDiv.part.add('transition-marker')
  innerDiv.part.add(transition.toColor)
  innerDiv.innerText = `${crosswalkIndex + 1}`
  return div
}
