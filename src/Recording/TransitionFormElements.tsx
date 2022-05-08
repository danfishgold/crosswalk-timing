import React, { ChangeEvent } from 'react'
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
  console.log({ crosswalkIds, a: transition.crosswalkId })
  const trackIndex = crosswalkIds.findIndex(
    (id) => crosswalkKey(id) === crosswalkKey(transition.crosswalkId),
  )

  const onTimestampChange = (timestamp: number | null) => {
    if (timestamp !== null) {
      onChange({ ...transition, timestamp })
    }
  }
  const onCrosswalkChange = (event: ChangeEvent<HTMLInputElement>) => {
    const index = event.target.valueAsNumber - 1
    const crosswalkId = crosswalkIds[index]
    onChange({ ...transition, crosswalkId })
  }
  const onColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const toColor = event.target.value as Color
    onChange({ ...transition, toColor })
  }

  return (
    <>
      <TimestampInput
        timestamp={transition.timestamp}
        setTimestamp={onTimestampChange}
      />
      {!isTrackIndexFieldHidden && (
        <input
          type='number'
          min={1}
          max={crosswalkIds.length}
          value={trackIndex + 1}
          onChange={onCrosswalkChange}
        />
      )}
      <input
        type='radio'
        name={`${formIdPrefix}-new-transition-color`}
        id={`${formIdPrefix}-new-transition-color--red`}
        value='red'
        checked={transition.toColor === 'red'}
        onChange={onColorChange}
      />
      <label htmlFor={`${formIdPrefix}-new-transition-color--red`}>אדום</label>
      <input
        type='radio'
        name={`${formIdPrefix}-new-transition-color`}
        id={`${formIdPrefix}-new-transition-color--green`}
        value='green'
        checked={transition.toColor === 'green'}
        onChange={onColorChange}
      />
      <label htmlFor={`${formIdPrefix}-new-transition-color--green`}>
        ירוק
      </label>
    </>
  )
}
