import { Heading, Link, VStack } from '@chakra-ui/react'
import { StateClipboardButtons } from './StateClipboardButtons'
import { sectionWidthCss } from './styleUtils'

export function DebugSection() {
  return (
    <VStack align='start' css={sectionWidthCss}>
      <Heading as='h2' size='lg'>
        דיבוג
      </Heading>
      <StateClipboardButtons />
      <p>
        <Link
          color='blue.500'
          href='#ארלוזורוב/הנרייטה%20סולד/JCoLC5CkS0nGHHHITEw4uaensaKjw6Kh'
        >
          דוגמה סולד 1
        </Link>
      </p>
      <p>
        <Link
          color='blue.500'
          href='#ארלוזורוב/הנרייטה%20סולד/JCoLC5CkS0nGHEnITEw4uaensaKjw6Kh'
        >
          דוגמה סולד 2
        </Link>
      </p>
    </VStack>
  )
}
