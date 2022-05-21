import React from 'react'
import { setJourneyIndexesString } from '../reducer'
import { useDispatch, useSelector } from '../store'

export default function JourneyCrosswalkIndexEditor() {
  const dispatch = useDispatch()
  const journeyIndexesString = useSelector(
    (state) => state.journeyIndexesString,
  )

  return (
    <div>
      <label htmlFor='journey-input'>מסלולים</label>
      <input
        id='journey-input'
        css={{ direction: 'ltr' }}
        value={journeyIndexesString}
        onChange={(event) => {
          dispatch(setJourneyIndexesString(event.target.value))
        }}
      />
    </div>
  )
}
