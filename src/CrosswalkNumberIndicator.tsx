import { useToken } from '@chakra-ui/react'
import React from 'react'
import { Highlight } from './reducer'

export default function CrosswalkNumberIndicator({
  number,
  withLegs,
  highlight,
}: {
  number: number
  withLegs: boolean
  highlight: Highlight | null
}) {
  const color = useToken('colors', highlight ? 'orange.500' : 'black')

  return (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: 'auto',
        gridTemplateRows: '1fr auto 1fr',
        justifyItems: 'center',
      }}
    >
      <div
        css={{
          width: '5px',
          height: withLegs ? '100%' : '0',
          background: color,
        }}
      />
      <div
        css={{
          width: '20px',
          height: '20px',
          borderRadius: '20px',
          background: color,
          color: 'white',
          textAlign: 'center',
          lineHeight: 1.25,
        }}
      >
        {number}
      </div>
      <div
        css={{
          width: '5px',
          height: withLegs ? '100%' : '0',
          background: color,
        }}
      />
    </div>
  )
}
