import { Button } from '@chakra-ui/button'
import { Heading } from '@chakra-ui/layout'
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
      <Heading as='h4' size='sm'>
        הוספת מעבר
      </Heading>
      <TransitionFormElements
        transition={transitionInForm}
        onChange={(transition) => setTransitionInForm(transition)}
        formIdPrefix='main-form'
      />
      <Button type='submit'>הוספה</Button>
    </form>
  )
}
