import { Heading, Link } from '@chakra-ui/react'
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
        <Link
          color='blue.500'
          href='#ארלוזורוב/הנרייטה%20סולד/QWuQpEtJxhxJyExMOLmnp7Gio8OioQ'
        >
          דוגמה סולד 1
        </Link>
      </p>
      <p>
        <Link
          color='blue.500'
          href='#ארלוזורוב/הנרייטה%20סולד/BBa5CkS0nGHHHITEw4uaensaKjyjoqE'
        >
          דוגמה סולד 2
        </Link>
      </p>
    </div>
  )
}
