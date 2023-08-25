import { FormControl, FormHelperText, FormLabel, Input } from '@chakra-ui/react'
import { setJourneyIndexesString } from '../reducer'
import { useDispatch, useSelector } from '../store'

export function JourneyCrosswalkIndexEditor({
  className,
}: {
  className?: string
}) {
  const dispatch = useDispatch()
  const journeyIndexesString = useSelector(
    (state) => state.journeyIndexesString,
  )

  return (
    <div className={className}>
      <FormControl css={{ maxWidth: '400px' }}>
        <FormLabel htmlFor='journey-input'>מסלולים</FormLabel>
        <Input
          id='journey-input'
          css={{ direction: 'ltr' }}
          value={journeyIndexesString}
          onChange={(event) => {
            dispatch(setJourneyIndexesString(event.target.value))
          }}
        />
        <FormHelperText>
          מסלול מורכב ממספרי מעברי החציה שלו מופרדים ברווחים (למשל ״1 2 3״).
          אפשר להכניס כמה מסלולים מופרדים בפסיק.
        </FormHelperText>
      </FormControl>
    </div>
  )
}
