import { Input, InputProps } from '@chakra-ui/input'
import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'
import { formatTimestamp } from './utils'

export default function TimestampInput({
  timestamp,
  setTimestamp,
  onKeyDown: externalOnKeyDown,
  ...props
}: {
  timestamp: number | null
  setTimestamp: (timestamp: number | null) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
} & Exclude<InputProps, 'value' | 'onChange'>) {
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

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newTimestamp = parseTimestamp(event.target.value)
    if (newTimestamp === null) {
      setTimestamp(null)
    } else if (newTimestamp && newTimestamp !== timestamp) {
      setTimestamp(newTimestamp)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    externalOnKeyDown?.(event)
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
    const newValue = addSecondsToTimestamp(value, delta)
    if (newValue) {
      event.preventDefault()
      setValue(newValue.asString)
      setTimestamp(newValue.timestamp)
    }
  }

  return (
    <Input
      size='sm'
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
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
): { timestamp: number; asString: string } | null {
  const timestamp = parseTimestamp(value)
  if (timestamp === null) {
    return null
  }
  const newTimestamp = Math.max(0, timestamp + secondsToAdd)
  return {
    timestamp: newTimestamp,
    asString: formatTimestamp(newTimestamp),
  }
}
