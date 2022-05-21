import React from 'react'
export default function Popover({
  x,
  y,
  ...props
}: { x: number; y: number } & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      css={{
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
        transform: 'translateX(-50%)',
        background: 'white',
        padding: '10px',
        border: '1px solid black',
      }}
      {...props}
    ></div>
  )
}
