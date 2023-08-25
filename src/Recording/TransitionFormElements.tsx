import { Stack } from '@chakra-ui/layout'
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/number-input'
import { Radio, RadioGroup } from '@chakra-ui/radio'
import { FormControl, FormLabel } from '@chakra-ui/react'
import { Color, selectCrosswalkIdsWithTrafficLights } from '../reducer'
import { useSelector } from '../store'
import TimestampInput from '../TimestampInput'

export function TimestampField({
  formIdPrefix,
  timestamp,
  setTimestamp,
}: {
  formIdPrefix: string
  timestamp: number
  setTimestamp: (timestamp: number | null) => void
}) {
  return (
    <FormControl>
      <FormLabel htmlFor={`${formIdPrefix}-timestamp-input`}>
        נקודת זמן
      </FormLabel>
      <TimestampInput
        id={`${formIdPrefix}-timestamp-input`}
        timestamp={timestamp}
        setTimestamp={setTimestamp}
        css={{ maxWidth: '100px' }}
      />
    </FormControl>
  )
}

export function TrackIndexField({
  formIdPrefix,
  trackIndex,
  setTrackIndex,
}: {
  formIdPrefix: string
  trackIndex: number
  setTrackIndex: (index: number) => void
}) {
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)

  return (
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
  return (
    <FormControl>
      <FormLabel>צבע הרמזור</FormLabel>
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
    </FormControl>
  )
}
