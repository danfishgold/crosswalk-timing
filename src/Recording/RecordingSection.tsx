import React, { useEffect, useState } from 'react'
import {
  addTransitionThroughForm,
  selectCrosswalkIds,
  setRecordingDuration,
  Transition,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import TimestampInput from '../TimestampInput'
import Timeline from './Timeline'
import TransitionFormElements from './TransitionFormElements'
import TransitionList from './TransitionList'

export default function TimelineEditor() {
  return (
    <div>
      <h2>הקלטה</h2>
      <RecordingDurationEditor />
      <Timeline />
      <NewTransitionForm />
      <TransitionList />
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

function NewTransitionForm() {
  const dispatch = useDispatch()
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const [transitionInForm, setTransitionInForm] = useState<Transition>({
    timestamp: 0,
    crosswalkId: crosswalkIds[0],
    toColor: 'green',
  })

  useEffect(() => {
    setTransitionInForm({ ...transitionInForm, crosswalkId: crosswalkIds[0] })
  }, [crosswalkIds])

  return (
    <form
      onSubmit={(event) => {
        console.log('fsdfsd')
        event.preventDefault()
        dispatch(addTransitionThroughForm(transitionInForm))
      }}
    >
      <TransitionFormElements
        transition={transitionInForm}
        onChange={(transition) => setTransitionInForm(transition)}
        formIdPrefix='main-form'
      />
      <button type='submit'>הוספה</button>
    </form>
  )
}
