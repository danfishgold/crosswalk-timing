import { Stack } from '@chakra-ui/layout'
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/number-input'
import { Radio, RadioGroup } from '@chakra-ui/radio'
import { FormControl, FormLabel, InputProps } from '@chakra-ui/react'
import { useId } from 'react'
import { selectCrosswalkIdsWithTrafficLights } from '../reducer'
import { Color } from '../state'
import { useSelector } from '../store'
import TimestampInput from '../TimestampInput'

export function TimestampField({
  timestamp,
  setTimestamp,
  onKeyDown,
}: {
  timestamp: number
  setTimestamp: (timestamp: number | null) => void
  onKeyDown?: InputProps['onKeyDown']
}) {
  const id = useId()

  return (
    <FormControl>
      <FormLabel htmlFor={id}>נקודת זמן</FormLabel>
      <TimestampInput
        id={id}
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        onKeyDown={onKeyDown}
      />
    </FormControl>
  )
}

export function TrackIndexField({
  trackIndex,
  setTrackIndex,
}: {
  trackIndex: number
  setTrackIndex: (index: number) => void
}) {
  const id = useId()
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)

  return (
    <FormControl>
      <FormLabel htmlFor={id}>מספר מעבר חציה</FormLabel>
      <NumberInput
        id={id}
        size='sm'
        min={1}
        max={crosswalkIds.length}
        value={trackIndex + 1}
        onChange={(_, valueAsNumber) => setTrackIndex(valueAsNumber - 1)}
        css={{ direction: 'ltr' }}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  )
}

export function ColorSwitcher({
  selectedColor,
  setSelectedColor,
}: {
  selectedColor: Color
  setSelectedColor: (color: Color) => void
}) {
  const id = useId()

  return (
    <FormControl>
      <FormLabel htmlFor={id} marginBottom='12px'>
        צבע הרמזור
      </FormLabel>
      <RadioGroup
        id={id}
        value={selectedColor}
        onChange={setSelectedColor}
        marginBottom='4px'
      >
        <Stack direction='row-reverse' justify='flex-end'>
          <Radio value='red' colorScheme={'red'}>
            אדום
          </Radio>
          <Radio value='green' colorScheme={'green'}>
            ירוק
          </Radio>
        </Stack>
      </RadioGroup>
    </FormControl>
  )
}
