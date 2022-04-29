export default function Popover({
  x,
  y,
  style,
  ...props
}: { x: number; y: number } & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      style={{
        ...style,
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
        transform: 'translateX(-50%)',
      }}
      {...props}
    ></div>
  )
}
