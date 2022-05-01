import { KeyboardEvent, useEffect, useState } from 'react'
import { formatTimestamp } from './utils'

export default function TimestampInput({
  timestamp,
  setTimestamp,
  ...props
}: {
  timestamp: number
  setTimestamp: (timestamp: number) => void
} & Exclude<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  'value' | 'onChange' | 'onKeyDown'
>) {
  const [value, setValue] = useState(formatTimestamp(timestamp))

  useEffect(() => {
    const newValue = formatTimestamp(timestamp)
    if (newValue !== value) {
      setValue(newValue)
    }
  }, [timestamp])

  useEffect(() => {
    const newTimestamp = parseTimestamp(value)
    if (newTimestamp && newTimestamp !== timestamp) {
      setTimestamp(newTimestamp)
    }
  }, [value])

  const onMouseDown = (event: KeyboardEvent<HTMLInputElement>) => {
    let delta = 0
    if (event.key === 'ArrowUp') {
      delta = 1
    } else if (event.key === 'ArrowDown') {
      delta = -1
    }
    if (event.shiftKey) {
      delta *= 10
    }

    if (delta === 0) {
      return
    }
    const [newValue, isValueChanged] = addSecondsToTimestamp(value, delta)
    if (isValueChanged) {
      event.preventDefault()
      setValue(newValue)
    }
  }

  return (
    <input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={onMouseDown}
      {...props}
    />
  )
}

function parseTimestamp(value: string): number | null {
  const match = value.match(/^(\d+):(\d\d)$/)
  const timestamp = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : null

  return timestamp
}

function addSecondsToTimestamp(
  value: string,
  secondsToAdd: number,
): [string, boolean] {
  const timestamp = parseTimestamp(value)
  if (timestamp !== null) {
    return [formatTimestamp(timestamp + secondsToAdd), true]
  } else {
    return [value, false]
  }
}
