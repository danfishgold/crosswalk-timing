import { Heading } from '@chakra-ui/layout'
import React from 'react'
import { selectCrosswalkIds, setRecordingDuration } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { sectionWidthCss } from '../styleUtils'
import TimestampInput from '../TimestampInput'
import Timeline from './Timeline'
import TransitionList from './TransitionList'

export default function TimelineEditor() {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const hasCrosswalks = crosswalkIds.length > 0
  return (
    <div css={sectionWidthCss}>
      <Heading as='h2' size='lg'>
        הקלטה
      </Heading>
      <RecordingDurationEditor />
      <Timeline />
      {hasCrosswalks && <TransitionList />}
    </div>
  )
}

function RecordingDurationEditor() {
  const dispatch = useDispatch()
  const duration = useSelector((state) => state.recordingDuration)

  return (
    <div>
      <label htmlFor='duration-input'>משך ההקלטה:</label>
      <TimestampInput
        timestamp={duration}
        setTimestamp={(value) => {
          if (value !== null) {
            dispatch(setRecordingDuration(value))
          }
        }}
        id='duration-input'
      />
    </div>
  )
}
