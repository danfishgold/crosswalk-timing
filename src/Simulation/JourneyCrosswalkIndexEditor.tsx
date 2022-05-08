import { useState } from 'react'

export default function JourneyCrosswalkIndexEditor({
  setIndexes,
}: {
  setIndexes: (indexes: number[] | null) => void
}) {
  const [journeyInputValue, setJourneyInputValue] = useState('')

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
          setIndexes(indexes)
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
