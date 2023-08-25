import { useToken } from '@chakra-ui/react'
import { selectCrosswalkHighlightColors } from './reducer'
import { CrosswalkId, crosswalkKey } from './state'
import { useSelector } from './store'
import { rgbValuesForColor, textColor } from './styleUtils'

export default function CrosswalkNumberIndicator({
  id,
  number,
}: {
  id: CrosswalkId
  number: number
}) {
  const highlights = useSelector(selectCrosswalkHighlightColors)
  const color = useToken(
    'colors',
    highlights[crosswalkKey(id)] ? 'orange.300' : 'orange.200',
  )

  return (
    <div
      css={{
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        css={{
          width: '20px',
          height: '20px',
          borderRadius: '20px',
          background: color,
          color: textColor(...rgbValuesForColor(color)),
          textAlign: 'center',
          lineHeight: 1.25,
        }}
      >
        {number}
      </div>
    </div>
  )
}
