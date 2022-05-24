import { Heading } from '@chakra-ui/layout'
import React from 'react'
import StateClipboardButtons from './StateClipboardButtons'
import { sectionWidthCss } from './styleUtils'

export default function DebugSection() {
  return (
    <div css={sectionWidthCss}>
      <Heading as='h2' size='lg'>
        דיבוג
      </Heading>
      <StateClipboardButtons />
      <p>
        <a href='#ארלוזורוב/הנרייטה%20סולד/QWuQpEtJxhxJyExMOLmnp7Gio8OioQ'>
          דוגמה סולד 1
        </a>
      </p>
      <p>
        <a href='#ארלוזורוב/הנרייטה%20סולד/BBa5CkS0nGHHHITEw4uaensaKjyjoqE'>
          דוגמה סולד 2
        </a>
      </p>
    </div>
  )
}
