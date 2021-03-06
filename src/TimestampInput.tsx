import { Input, InputProps } from '@chakra-ui/input'
import React, { KeyboardEvent, useEffect, useState } from 'react'
import { formatTimestamp } from './utils'

export default function TimestampInput({
  timestamp,
  setTimestamp,
  ...props
}: {
  timestamp: number | null
  setTimestamp: (timestamp: number | null) => void
} & Exclude<InputProps, 'value' | 'onChange' | 'onKeyDown'>) {
  const [value, setValue] = useState(
    timestamp !== null ? formatTimestamp(timestamp) : '',
  )

  useEffect(() => {
    if (timestamp === null) {
      setValue('')
    } else {
      const newValue = formatTimestamp(timestamp)
      if (newValue !== value) {
        setValue(newValue)
      }
    }
  }, [timestamp])

  useEffect(() => {
    const newTimestamp = parseTimestamp(value)
    if (newTimestamp === null) {
      setTimestamp(null)
    } else if (newTimestamp && newTimestamp !== timestamp) {
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
    <Input
      size='sm'
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
