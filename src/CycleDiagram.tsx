import { useState } from 'react'
import { useSelector } from './store'

export default function CycleDiagram() {
  const [offset, setOffset] = useState(0)
  const cycleDuration = useSelector((state) => state.cycleDuration)
  if (!cycleDuration) {
    return null
  }

  return (
    <div>
      <h2>מחזור</h2>
      <label htmlFor='cycle-offset-input'>
        אני לא זוכר איך אומרים אופסט בעברית:
      </label>
      <input
        id='cycle-offset-input'
        type='number'
        value={offset}
        onChange={(event) => setOffset(event.target.valueAsNumber)}
      />
    </div>
  )
}
