import { Button, ButtonGroup } from '@chakra-ui/button'
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
    <ButtonGroup isAttached css={{ direction: 'ltr' }}>
      <Button css={{ direction: 'rtl' }} onClick={paste}>
        להדביק state מה-clipboard
      </Button>
      <Button css={{ direction: 'rtl' }} onClick={copy}>
        להעתיק state נוכחי
      </Button>
    </ButtonGroup>
  )
}
