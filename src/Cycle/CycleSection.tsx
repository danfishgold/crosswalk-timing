import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/number-input'
import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Heading,
  VStack,
} from '@chakra-ui/react'
import {
  selectCycleDurationSuggestions,
  setCycleDuraration,
  setCycleOffset,
} from '../reducer'
import { Cycle } from '../state'
import { useDispatch, useSelector } from '../store'
import { sectionWidthCss } from '../styleUtils'
import { formatTimestamp } from '../utils'
import { CycleDiagram } from './CycleDiagram'
import { TimedEventEditor } from './TimedEventEditor'

export function CycleSection() {
  const cycle = useSelector((state) => state.cycle)

  return (
    <VStack align='start' css={sectionWidthCss} spacing='20px'>
      <Heading as='h2' size='lg'>
        מחזור
      </Heading>
      <CycleDurationSelector />
      {cycle && (
        <>
          <TimedEventEditor cycle={cycle} />
          <CycleOffsetInput cycle={cycle} />
          <CycleDiagram cycle={cycle} css={{ width: '100%' }} />
        </>
      )}
    </VStack>
  )
}

function CycleDurationSelector() {
  const dispatch = useDispatch()
  const cycleDurationSuggestions = useSelector(selectCycleDurationSuggestions)
  if (cycleDurationSuggestions.length === 0) {
    return (
      <div>
        <p>
          סמנו זמני אירועי רמזורים בחלק למעלה כדי לקבל הצעות לחישוב זמן המחזור
          של הצומת
        </p>
      </div>
    )
  }
  return (
    <div>
      <span>זמני מחזור אפשריים:</span>
      <ButtonGroup>
        {cycleDurationSuggestions.map((suggestion) => (
          <Button
            size='xs'
            key={suggestion.duration}
            onClick={() => dispatch(setCycleDuraration(suggestion.duration))}
          >
            {`${formatTimestamp(suggestion.duration)} (${
              suggestion.conflictCount
            } קונפליקטים)`}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}

function CycleOffsetInput({ cycle }: { cycle: Cycle }) {
  const dispatch = useDispatch()

  return (
    <FormControl css={{ maxWidth: '400px' }}>
      <FormLabel htmlFor='cycle-offset-input'>היסט (offset) (בשניות)</FormLabel>
      <NumberInput
        size='sm'
        id='cycle-offset-input'
        value={cycle.offset}
        onChange={(_, value) => dispatch(setCycleOffset(value))}
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
