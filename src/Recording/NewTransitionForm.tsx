import { Button } from '@chakra-ui/button'
import { Flex, Heading, Spacer, VStack } from '@chakra-ui/layout'
import { HStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import {
  addTransitionThroughForm,
  Color,
  selectCrosswalkIdsWithTrafficLights,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import {
  ColorSwitcher,
  TimestampField,
  TrackIndexField,
} from './TransitionFormElements'

export default function NewTransitionForm({
  timestamp,
  setTimestamp,
  isPlaying,
  setIsPlaying,
}: {
  timestamp: number
  setTimestamp: (timestamp: number) => void
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
}) {
  const dispatch = useDispatch()
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)

  const [crosswalkIndex, setCrosswalkIndex] = useState(0)
  const [toColor, setToColor] = useState<Color>('green')

  useEffect(() => {
    setCrosswalkIndex(0)
  }, [crosswalkIds])

  return (
    <form
      css={{ width: '100%' }}
      onSubmit={(event) => {
        event.preventDefault()
        dispatch(
          addTransitionThroughForm({
            timestamp,
            crosswalkId: crosswalkIds[crosswalkIndex],
            toColor,
          }),
        )
      }}
    >
      <VStack
        spacing='10px'
        align='start'
        justify='stretch'
        background='blue.50'
        padding='20px'
        borderRadius='md'
      >
        <Heading as='h3' size='md'>
          הוספת מעבר
        </Heading>
        <Flex align='flex-end' direction='row' width='100%'>
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'הפסק הקלטה' : 'הפעל הקלטה'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </Button>
          <HStack>
            <TimestampField
              timestamp={timestamp}
              setTimestamp={(timestamp) => {
                if (timestamp !== null) {
                  setTimestamp(timestamp)
                }
              }}
            />
            <TrackIndexField
              trackIndex={crosswalkIndex}
              setTrackIndex={setCrosswalkIndex}
            />
            <ColorSwitcher
              selectedColor={toColor}
              setSelectedColor={setToColor}
            />
          </HStack>
          <Spacer />
          <Button type='submit' size='sm' colorScheme='blue'>
            הוספה
          </Button>
        </Flex>
      </VStack>
    </form>
  )
}
