import { UseCounterProps } from '@chakra-ui/counter'
import { HStack, Stack } from '@chakra-ui/layout'
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/number-input'
import { Radio, RadioGroup } from '@chakra-ui/radio'
import { FormControl, FormLabel } from '@chakra-ui/react'
import React from 'react'
import { Color, crosswalkKey, selectCrosswalkIds, Transition } from '../reducer'
import { useSelector } from '../store'
import TimestampInput from '../TimestampInput'

export default function TransitionFormElements({
  transition,
  onChange,
  formIdPrefix,
  isTrackIndexFieldHidden = false,
}: {
  transition: Transition
  onChange: (transition: Transition) => void
  formIdPrefix: string
  isTrackIndexFieldHidden?: boolean
}) {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const trackIndex = crosswalkIds.findIndex(
    (id) => crosswalkKey(id) === crosswalkKey(transition.crosswalkId),
  )

  const onTimestampChange = (timestamp: number | null) => {
    if (timestamp !== null) {
      onChange({ ...transition, timestamp })
    }
  }
  const onCrosswalkChange: UseCounterProps['onChange'] = (_, numberValue) => {
    const index = numberValue - 1
    const crosswalkId = crosswalkIds[index]
    onChange({ ...transition, crosswalkId })
  }
  const setSelectedColor = (toColor: Color) => {
    onChange({ ...transition, toColor })
  }

  return (
    <HStack>
      <FormControl>
        <FormLabel htmlFor={`${formIdPrefix}-timestamp-input`}>
          נקודת זמן
        </FormLabel>
        <TimestampInput
          id={`${formIdPrefix}-timestamp-input`}
          timestamp={transition.timestamp}
          setTimestamp={onTimestampChange}
          css={{ maxWidth: '100px' }}
        />
      </FormControl>

      {!isTrackIndexFieldHidden && (
        <FormControl>
          <FormLabel htmlFor={`${formIdPrefix}-crosswalk-index`}>
            מספר מעבר חציה
          </FormLabel>
          <NumberInput
            id={`${formIdPrefix}-crosswalk-index`}
            size='sm'
            min={1}
            max={crosswalkIds.length}
            value={trackIndex + 1}
            onChange={onCrosswalkChange}
            css={{ direction: 'ltr' }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      )}
      <FormControl>
        <FormLabel>צבע הרמזור</FormLabel>
        <ColorSwitcher
          selectedColor={transition.toColor}
          setSelectedColor={setSelectedColor}
        />
      </FormControl>
    </HStack>
  )
}

function ColorSwitcher({
  selectedColor,
  setSelectedColor,
}: {
  selectedColor: Color
  setSelectedColor: (color: Color) => void
}) {
  return (
    <RadioGroup value={selectedColor} onChange={setSelectedColor}>
      <Stack direction='row-reverse' justify='flex-end'>
        <Radio value='red' colorScheme={'red'}>
          אדום
        </Radio>
        <Radio value='green' colorScheme={'green'}>
          ירוק
        </Radio>
      </Stack>
    </RadioGroup>
  )
}
