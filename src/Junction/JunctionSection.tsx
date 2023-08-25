import {
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  VStack,
} from '@chakra-ui/react'
import { useId } from 'react'
import { setRotation } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { sectionWidthCss } from '../styleUtils'
import { JunctionSvg } from './JunctionSvg'

export function JunctionSection() {
  const inEditMode = useSelector((state) => state.inEditMode)

  return (
    <VStack css={sectionWidthCss}>
      <JunctionSvg inEditMode={inEditMode} />
      <RotationField />
    </VStack>
  )
}

function RotationField() {
  const dispatch = useDispatch()
  const junctionRotation = useSelector((state) => state.junctionRotation)
  const id = useId()

  return (
    <FormControl css={{ maxWidth: '400px' }} alignSelf='flex-start'>
      <FormLabel htmlFor={id}>זווית הצומת</FormLabel>
      <NumberInput
        size='sm'
        id={id}
        value={junctionRotation}
        onChange={(_, value) => dispatch(setRotation(value))}
      >
        <NumberInputField css={{ direction: 'ltr', maxWidth: '100px' }} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  )
}
