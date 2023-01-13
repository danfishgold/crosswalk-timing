import { Button } from '@chakra-ui/button'
import { Flex, Heading, Spacer, VStack } from '@chakra-ui/layout'
import { useEffect, useState } from 'react'
import {
  addTransitionThroughForm,
  selectCrosswalkIdsWithTrafficLights,
  Transition,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import TransitionFormElements from './TransitionFormElements'

export default function NewTransitionForm() {
  const dispatch = useDispatch()
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)
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
      css={{ width: '100%' }}
      onSubmit={(event) => {
        event.preventDefault()
        dispatch(addTransitionThroughForm(transitionInForm))
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
          <TransitionFormElements
            transition={transitionInForm}
            onChange={(transition) => setTransitionInForm(transition)}
            formIdPrefix='main-form'
          />
          <Spacer />
          <Button type='submit' size='sm' colorScheme='blue'>
            הוספה
          </Button>
        </Flex>
      </VStack>
    </form>
  )
}
