import React from 'react'
import { Highlight } from './reducer'
import { highlightColors } from './utils'

export default function CrosswalkNumberIndicator({
  number,
  highlight,
}: {
  number: number
  highlight: Highlight | null
}) {
  const color = highlight ? highlightColors[highlight] : 'black'

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
          height: '100%',
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
        }}
      >
        {number}
      </div>
      <div
        css={{
          width: '5px',
          height: '100%',
          background: color,
        }}
      />
    </div>
  )
}
