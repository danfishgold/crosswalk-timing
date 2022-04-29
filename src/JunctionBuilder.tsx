import React, { MouseEventHandler, useEffect, useState } from 'react'

const legWidth = 30
const legLength = 30
const crosswalkLength = 20
const crosswalkSegmentsInEachDirection = 3
const islandWidthInSegments = 2

export type Leg = { crosswalk: boolean; island: boolean } | null
export type Legs = [Leg, Leg, Leg, Leg]

export default function JunctionBuilder({
  legs,
  setLegs,
}: {
  legs: Legs
  setLegs: (legs: Legs) => void
}) {
  const [junctionTitle, setJunctionTitle] = useState('')

  const setLeg = (index: number, leg: Leg) =>
    setLegs(setArrayItem(legs, index, leg) as [Leg, Leg, Leg, Leg])

  const [inEditMode, setInEditMode] = useState(true)
  const [selectedLegIndex, setSelectedLegIndex] = useState<number | null>(null)

  const viewBoxOffset = legWidth / 2 + legLength

  useEffect(() => {
    setSelectedLegIndex(null)
  }, [inEditMode])

  return (
    <div>
      <div>
        {inEditMode ? (
          <>
            <button onClick={() => setInEditMode(false)}>שמירה</button>
          </>
        ) : (
          <>
            <button onClick={() => setInEditMode(true)}>עריכה</button>
          </>
        )}
      </div>
      {inEditMode ? (
        <div>
          <label>שם הצומת</label>
          <input
            value={junctionTitle}
            onChange={(event) => setJunctionTitle(event.target.value)}
          />
        </div>
      ) : (
        junctionTitle && <h1>{junctionTitle}</h1>
      )}
      <svg
        width='300px'
        height='300px'
        viewBox={`${-viewBoxOffset} ${-viewBoxOffset} ${viewBoxOffset * 2} ${
          viewBoxOffset * 2
        }`}
      >
        <rect
          className='road'
          x={-legWidth / 2}
          y={-legWidth / 2}
          width={legWidth}
          height={legWidth}
        />
        {range(4).map((legIndex) => (
          <g
            key={legIndex}
            transform={`rotate(${90 * legIndex - 90}) translate(${
              legWidth / 2
            },${-legWidth / 2})`}
          >
            {(inEditMode || legs[legIndex]) && (
              <JunctionLegGroup
                status={legs[legIndex]}
                onClick={
                  inEditMode ? () => setSelectedLegIndex(legIndex) : undefined
                }
                ariaLabel={legs[legIndex] ? 'עריכת כביש' : 'הוספת כביש'}
              />
            )}
          </g>
        ))}
      </svg>
      {inEditMode && (
        <div>
          <h2>עריכת צומת</h2>
          {selectedLegIndex === null ? (
            <p>לחצו על אחת הזרועות של הצומת כדי לערוך אותה</p>
          ) : (
            <div>
              <button onClick={() => setLeg(selectedLegIndex, null)}>
                שום כלום
              </button>
              <button
                onClick={() =>
                  setLeg(selectedLegIndex, {
                    crosswalk: false,
                    island: false,
                  })
                }
              >
                כביש בלי מעבר חציה
              </button>
              <button
                onClick={() =>
                  setLeg(selectedLegIndex, {
                    crosswalk: true,
                    island: false,
                  })
                }
              >
                מעבר חציה
              </button>
              <button
                onClick={() =>
                  setLeg(selectedLegIndex, {
                    crosswalk: true,
                    island: true,
                  })
                }
              >
                מעבר חציה + מפרדה
              </button>
              <button
                onClick={() =>
                  setLeg(selectedLegIndex, {
                    crosswalk: false,
                    island: true,
                  })
                }
              >
                בלי מעבר חציה אבל עם מפרדה
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function JunctionLegGroup({
  status,
  onClick,
  ariaLabel,
}: {
  status: Leg
  onClick?: MouseEventHandler<SVGElement>
  ariaLabel?: string
}) {
  const crosswalkSegmentCount =
    crosswalkSegmentsInEachDirection * 2 + islandWidthInSegments
  const crosswalkSegmentLength = legWidth / (crosswalkSegmentCount * 2 + 1)

  const islandY =
    crosswalkSegmentLength * (crosswalkSegmentsInEachDirection * 2 + 1)
  const islandHeight = crosswalkSegmentLength * (islandWidthInSegments * 2 - 1)

  const crosswalkOffset = islandHeight

  return (
    <g
      className={`leg ${status === null ? 'leg--placeholder' : ''} ${
        onClick ? 'leg--interactive' : ''
      }`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick && 'button'}
      aria-label={ariaLabel}
    >
      <rect
        className='leg__focus-ring'
        x={-1}
        y={-1}
        width={legLength + 2}
        height={legWidth + 2}
      />
      <rect className='road' x={0} y={0} width={legLength} height={legWidth} />
      {status?.crosswalk && (
        <g className='crosswalk'>
          {range(crosswalkSegmentCount).map((segmentIndex) => (
            <rect
              className='crosswalk-stripe'
              key={segmentIndex}
              x={crosswalkOffset}
              y={crosswalkSegmentLength * (segmentIndex * 2 + 1)}
              width={crosswalkLength}
              height={crosswalkSegmentLength}
            />
          ))}
        </g>
      )}
      {status?.island && (
        <g className='island'>
          <rect
            className='island--inset'
            x={0}
            y={islandY}
            width={2 * crosswalkOffset}
            height={islandHeight}
            rx={islandHeight / 2}
          />
          <rect
            className='island--separator'
            x={crosswalkOffset}
            y={islandY}
            width={legLength - crosswalkOffset}
            height={islandHeight}
          />
        </g>
      )}
    </g>
  )
}

function legClassNames(leg: Leg): string {
  return [
    'leg',
    leg ? 'leg--visible' : '',
    leg?.crosswalk ? 'leg--with-crosswalk' : '',
    leg?.island ? 'leg--with-island' : '',
  ].join(' ')
}

function range(n: number): number[] {
  return new Array(n).fill(0).map((_, index) => index)
}

function setArrayItem<T>(array: T[], index: number, value: T): T[] {
  return [...array.slice(0, index), value, ...array.slice(index + 1)]
}
