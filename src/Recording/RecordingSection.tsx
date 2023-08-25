import { Heading, VStack } from '@chakra-ui/layout'
import { useState } from 'react'
import { selectCrosswalkIdsWithTrafficLights } from '../reducer'
import { useSelector } from '../store'
import { sectionWidthCss } from '../styleUtils'
import { AudioPlayer } from './AudioPlayer'
import { NewTransitionForm } from './NewTransitionForm'
import { TransitionList } from './TransitionList'

export type TimelineTimestamp = {
  value: number
  fromWaveSurfer: boolean
}

export function TimelineEditor() {
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)
  const hasCrosswalks = crosswalkIds.length > 0
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timestamp, setTimestamp] = useState<TimelineTimestamp>({
    value: 0,
    fromWaveSurfer: false,
  })

  return (
    <VStack align='start' css={sectionWidthCss} spacing='20px'>
      <Heading as='h2' size='lg'>
        הקלטה
      </Heading>

      <FileInput
        onLoad={(url) => {
          setFileUrl(url)
          setTimestamp({ value: 0, fromWaveSurfer: false })
          setIsPlaying(false)
        }}
      />
      {fileUrl && (
        <AudioPlayer
          url={fileUrl}
          timestamp={timestamp}
          setTimestamp={setTimestamp}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      )}
      {hasCrosswalks && fileUrl && (
        <NewTransitionForm
          timestamp={Math.floor(timestamp.value)}
          setTimestamp={(value) =>
            setTimestamp({ value, fromWaveSurfer: false })
          }
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      )}
      {hasCrosswalks && fileUrl && <TransitionList />}
    </VStack>
  )
}

function FileInput({ onLoad }: { onLoad: (ur: string) => void }) {
  return (
    <input
      type='file'
      accept='audio/*'
      multiple={false}
      onChange={(event) => {
        const file = event.target.files?.[0]
        if (!file) {
          return
        }
        const reader = new FileReader()
        reader.onload = (loadEvent) =>
          onLoad(loadEvent.target!.result as string)

        reader.onerror = (errorEvent) =>
          console.error('An error ocurred while reading the file: ', errorEvent)

        reader.readAsDataURL(file)
      }}
    />
  )
}
