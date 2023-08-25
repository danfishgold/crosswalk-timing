import { useToken } from '@chakra-ui/system'
import { css } from '@emotion/react'
import { Color } from './state'

export const sectionWidthCss = css({
  width: '100%',
  maxWidth: '700px',
})

// https://stackoverflow.com/a/69057776
export function rgbValuesForColor(color: string): [number, number, number] {
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  if (!context) {
    throw new Error(`No canvas context somehow`)
  }
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

export function textColor(r: number, g: number, b: number): string {
  // http://www.w3.org/TR/AERT#color-contrast
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)
  const textColor = brightness > 125 ? 'black' : 'white'
  return textColor
}

export function useColorColors(): Record<Color, string> {
  const [red, green] = useToken('colors', ['red.500', 'green.400'])
  return { red, green }
}
