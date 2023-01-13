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
}

type DerivedSvgParameters = {
  crosswalkSegmentCount: number
  crosswalkSegmentLength: number
  islandY: number
  islandHeight: number
  crosswalkOffset: number
  cornerWidth: number
  circleOffset: number
}

function derivedSvgParameters({
  legWidth,
  crosswalkSegmentsInEachDirection,
  islandWidthInSegments,
  crosswalkLength,
  circleRadius,
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

  return {
    crosswalkSegmentCount,
    crosswalkSegmentLength,
    islandY,
    islandHeight,
    crosswalkOffset,
    cornerWidth,
    circleOffset,
  }
}

function svgParameters(): SvgParameters {
  const primaryParameters: PrimarySvgParameters = {
    legWidth: 30,
    legLength: 40,
    circleRadius: 3,
    crosswalkLength: 10,
    crosswalkSegmentsInEachDirection: 3,
    crosswalkSegmentsInDiagonal: 3,
    islandWidthInSegments: 2,
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
