import { Heading, Link, VStack } from '@chakra-ui/react'
import StateClipboardButtons from './StateClipboardButtons'
import { sectionWidthCss } from './styleUtils'

export default function DebugSection() {
  return (
    <VStack align='start' css={sectionWidthCss}>
      <Heading as='h2' size='lg'>
        דיבוג
      </Heading>
      <StateClipboardButtons />
      <p>
        <Link
          color='blue.500'
          href='#ארלוזורוב/הנרייטה%20סולד/JCoLkKRLScYccchMTDi5p6exoqPDoqE'
        >
          דוגמה סולד 1
        </Link>
      </p>
      <p>
        <Link
          color='blue.500'
          href='#ארלוזורוב/הנרייטה%20סולד/JCoLkKRLScYcSchMTDi5p6exoqPDoqE'
        >
          דוגמה סולד 2
        </Link>
      </p>
    </VStack>
  )
}
