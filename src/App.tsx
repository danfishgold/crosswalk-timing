import React, { Dispatch, SetStateAction, useState } from 'react'
import JunctionBuilder from './JunctionBuilder'

function App() {
  const [durationInputValue, setDurationInputValue, duration] =
    useDurationInput()
  return (
    <div>
      <DurationInput
        value={durationInputValue}
        setValue={setDurationInputValue}
      />
      <JunctionBuilder />
      {duration ? (
        <TimelineEditor duration={duration} />
      ) : (
        <BlankTimelineEditor />
      )}
    </div>
  )
}

function DurationInput({
  value,
  setValue,
}: {
  value: string
  setValue: Dispatch<SetStateAction<string>>
}) {
  return (
    <div>
      <label htmlFor='duration-input'>משך ההקלטה:</label>
      <input
        id='duration-input'
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}

function TimelineEditor({ duration }: { duration: number }) {
  return <div></div>
}

function BlankTimelineEditor() {
  return <div></div>
}

function useDurationInput(): [
  string,
  Dispatch<SetStateAction<string>>,
  number | null,
] {
  const [value, setValue] = useState('')

  const match = value.match(/^(\d+):(\d\d)$/)
  const duration = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : null

  return [value, setValue, duration]
}
export default App
