import { Heading, VStack } from '@chakra-ui/layout'
import { FormControl, FormLabel } from '@chakra-ui/react'
import React from 'react'
import { selectCrosswalkIds, setRecordingDuration } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { sectionWidthCss } from '../styleUtils'
import TimestampInput from '../TimestampInput'
import NewTransitionForm from './NewTransitionForm'
import Timeline from './Timeline'
import TransitionList from './TransitionList'

export default function TimelineEditor() {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const hasCrosswalks = crosswalkIds.length > 0
  return (
    <VStack align='start' css={sectionWidthCss} spacing='20px'>
      <Heading as='h2' size='lg'>
        הקלטה
      </Heading>
      <RecordingDurationEditor />
      <Timeline />
      {hasCrosswalks && <NewTransitionForm />}
      {hasCrosswalks && <TransitionList />}
    </VStack>
  )
}

function RecordingDurationEditor() {
  const dispatch = useDispatch()
  const duration = useSelector((state) => state.recordingDuration)

  return (
    <FormControl css={{ maxWidth: '400px' }}>
      <FormLabel htmlFor='duration-input'>משך ההקלטה</FormLabel>
      <TimestampInput
        timestamp={duration}
        setTimestamp={(value) => {
          if (value !== null) {
            dispatch(setRecordingDuration(value))
          }
        }}
        id='duration-input'
      />
    </FormControl>
  )
}
