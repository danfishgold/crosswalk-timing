import React, { useState } from 'react'
import { setJourneyIndexes } from '../reducer'
import { useDispatch, useSelector } from '../store'

export default function JourneyCrosswalkIndexEditor() {
  const dispatch = useDispatch()
  const journeyIndexes = useSelector((state) => state.journeyIndexes)

  const [journeyInputValue, setJourneyInputValue] = useState(
    journeyIndexes.map((index) => index + 1).join(' '),
  )

  return (
    <div>
      <label htmlFor='journey-input'>מסלול</label>
      <input
        id='journey-input'
        value={journeyInputValue}
        onChange={(event) => {
          const valueString = event.target.value
          setJourneyInputValue(valueString)
          const indexes = parseJourneyCrosswalkIndexes(valueString)
          dispatch(setJourneyIndexes(indexes ?? []))
        }}
      />
    </div>
  )
}

function parseJourneyCrosswalkIndexes(valueString: string): number[] | null {
  const numbers = (valueString.match(/\d+/g) ?? []).map(
    (indexString) => parseInt(indexString.trim()) - 1,
  )
  if (numbers.some(isNaN)) {
    return null
  }
  return numbers
}
