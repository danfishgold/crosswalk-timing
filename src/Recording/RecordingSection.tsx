import React, { useEffect, useState } from 'react'
import {
  addTransitionThroughForm,
  selectCrosswalkIds,
  setRecordingDuration,
  Transition,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import { sectionWidthCss } from '../styleUtils'
import TimestampInput from '../TimestampInput'
import Timeline from './Timeline'
import TransitionFormElements from './TransitionFormElements'
import TransitionList from './TransitionList'

export default function TimelineEditor() {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const hasCrosswalks = crosswalkIds.length > 0
  return (
    <div css={sectionWidthCss}>
      <h2>הקלטה</h2>
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
