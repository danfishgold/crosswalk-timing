import React, { useEffect, useState } from 'react'
import {
  addTransitionThroughForm,
  selectCrosswalkIds,
  Transition,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import TransitionFormElements from './TransitionFormElements'

export default function NewTransitionForm() {
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
      css={{ border: '1px solid black', padding: '10px' }}
      onSubmit={(event) => {
        event.preventDefault()
        dispatch(addTransitionThroughForm(transitionInForm))
      }}
    >
      <h4 css={{ marginLeft: '10px', marginTop: '5px' }}>הוספת מעבר</h4>
      <TransitionFormElements
        transition={transitionInForm}
        onChange={(transition) => setTransitionInForm(transition)}
        formIdPrefix='main-form'
      />
      <button type='submit'>הוספה</button>
    </form>
  )
}
