import React, { useState } from 'react'
import { setJourneyIndexes } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { compact } from '../utils'

export default function JourneyCrosswalkIndexEditor() {
  const dispatch = useDispatch()
  const journeyIndexes = useSelector((state) => state.journeyIndexes)

  const [journeyInputValue, setJourneyInputValue] = useState(
    journeyIndexes
      .map((indexes) => indexes.map((index) => index + 1).join(' '))
      .join(','),
  )

  return (
    <div>
      <label htmlFor='journey-input'>מסלולים</label>
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

function parseJourneyCrosswalkIndexes(valueString: string): number[][] {
  const journeyStrings = valueString.trim().split(',')
  const journeyIndexes = compact(
    journeyStrings.map((journeyString) => {
      const numbers = journeyString
        .trim()
        .split(/\s+/)
        .map((indexString) => parseInt(indexString.trim()) - 1)
      if (numbers.some(isNaN) || numbers.length === 0) {
        return null
      } else {
        return numbers
      }
    }),
  )
  return journeyIndexes
}
