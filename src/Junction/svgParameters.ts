import { useMemo } from 'react'

export type SvgParameters = PrimarySvgParameters & DerivedSvgParameters

type PrimarySvgParameters = {
  legWidth: number
  legLength: number
  crosswalkLength: number
  crosswalkSegmentsInEachDirection: number
  crosswalkSegmentsInDiagonal: number
  islandWidthInSegments: number
  circleRadius: number
  rotation: number
}

type DerivedSvgParameters = {
  crosswalkSegmentCount: number
  crosswalkSegmentLength: number
  islandY: number
  islandHeight: number
  crosswalkOffset: number
  cornerWidth: number
  circleOffset: number
  scale: number
}

function derivedSvgParameters({
  legWidth,
  crosswalkSegmentsInEachDirection,
  islandWidthInSegments,
  crosswalkLength,
  circleRadius,
  rotation,
}: PrimarySvgParameters): DerivedSvgParameters {
  const crosswalkSegmentCount =
    crosswalkSegmentsInEachDirection * 2 + islandWidthInSegments
  const crosswalkSegmentLength = legWidth / (crosswalkSegmentCount * 2 + 1)
  const islandHeight = crosswalkSegmentLength * (islandWidthInSegments * 2 - 1)
  const islandY =
    crosswalkSegmentLength * (crosswalkSegmentsInEachDirection * 2 + 1)
  const crosswalkOffset = islandHeight / 2
  const cornerWidth = crosswalkOffset * 3 + crosswalkLength
  const circleOffset =
    legWidth / 2 + crosswalkOffset * 2 + crosswalkLength + circleRadius

  const rotationInRadians = rotation * (Math.PI / 180)
  const scale =
    Math.abs(Math.cos(rotationInRadians)) +
    Math.abs(Math.sin(rotationInRadians))

  return {
    crosswalkSegmentCount,
    crosswalkSegmentLength,
    islandY,
    islandHeight,
    crosswalkOffset,
    cornerWidth,
    circleOffset,
    scale,
  }
}

function svgParameters(): SvgParameters {
  const primaryParameters: PrimarySvgParameters = {
    legWidth: 30,
    legLength: 40,
    circleRadius: 4,
    crosswalkLength: 10,
    crosswalkSegmentsInEachDirection: 3,
    crosswalkSegmentsInDiagonal: 3,
    islandWidthInSegments: 2,
    rotation: 120,
  }
  return {
    ...primaryParameters,
    ...derivedSvgParameters(primaryParameters),
  }
}

export function useSvgParameters(): SvgParameters {
  const parameters = useMemo(() => svgParameters(), [])

  return parameters
}
