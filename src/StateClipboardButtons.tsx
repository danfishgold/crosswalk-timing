import React from 'react'
import { replaceEntireState } from './reducer'
import { useDispatch, useSelector } from './store'

export default function StateClipboardButtons() {
  const dispatch = useDispatch()
  const state = useSelector((state) => state)

  const paste = () => {
    navigator.clipboard
      .readText()
      .then((text) => dispatch(replaceEntireState(JSON.parse(text))))
      .then(() => console.log('pasted'))
  }

  const copy = () => {
    navigator.clipboard
      .writeText(JSON.stringify(state))
      .then(() => console.log('copied'))
  }

  return (
    <div>
      <button onClick={copy}>להעתיק state נוכחי</button>
      <button onClick={paste}>להדביק state מה-clipboard</button>
    </div>
  )
}
