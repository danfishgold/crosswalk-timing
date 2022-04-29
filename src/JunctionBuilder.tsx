import React, { MouseEventHandler, useEffect, useState } from 'react'
import { Leg, LegId, legIds, setJunctionTitle, setLeg } from './reducer'
import { useDispatch, useSelector } from './store'
import { range } from './utils'

const legWidth = 30
const legLength = 30
const crosswalkLength = 20
const crosswalkSegmentsInEachDirection = 3
const islandWidthInSegments = 2

const legRotation: Record<LegId, number> = {
  n: -90,
  e: 0,
  s: 90,
  w: 180,
}

export default function JunctionBuilder() {
  const dispatch = useDispatch()
  const junctionTitle = useSelector((state) => state.junctionTitle)
  const junction = useSelector((state) => state.junction)

  const [inEditMode, setInEditMode] = useState(false)
  const [selectedLegId, setSelectedLegId] = useState<LegId | null>(null)

  const viewBoxOffset = legWidth / 2 + legLength

  useEffect(() => {
    setSelectedLegId(null)
  }, [inEditMode])

  return (
    <div>
      <div>
        {inEditMode ? (
          <button onClick={() => setInEditMode(false)}>שמירה</button>
        ) : (
          <button onClick={() => setInEditMode(true)}>עריכה</button>
        )}
      </div>
      {inEditMode ? (
        <div>
          <label>שם הצומת</label>
          <input
            value={junctionTitle}
            onChange={(event) => dispatch(setJunctionTitle(event.target.value))}
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
        {legIds.map((legId) => (
          <g
            key={legId}
            transform={`rotate(${legRotation[legId]}) translate(${
              legWidth / 2
            },${-legWidth / 2})`}
          >
            {(inEditMode || junction[legId]) && (
              <JunctionLegGroup
                leg={junction[legId]}
                onClick={inEditMode ? () => setSelectedLegId(legId) : undefined}
                ariaLabel={junction[legId] ? 'עריכת כביש' : 'הוספת כביש'}
              />
            )}
          </g>
        ))}
      </svg>
      {inEditMode && (
        <div>
          <h2>עריכת צומת</h2>
          {selectedLegId === null ? (
            <p>לחצו על אחת הזרועות של הצומת כדי לערוך אותה</p>
          ) : (
            <div>
              <button
                onClick={() =>
                  dispatch(setLeg({ legId: selectedLegId, leg: null }))
                }
              >
                שום כלום
              </button>
              <button
                onClick={() =>
                  dispatch(
                    setLeg({
                      legId: selectedLegId,
                      leg: {
                        crosswalk: false,
                        island: false,
                      },
                    }),
                  )
                }
              >
                כביש בלי מעבר חציה
              </button>
              <button
                onClick={() =>
                  dispatch(
                    setLeg({
                      legId: selectedLegId,
                      leg: {
                        crosswalk: true,
                        island: false,
                      },
                    }),
                  )
                }
              >
                מעבר חציה
              </button>
              <button
                onClick={() =>
                  dispatch(
                    setLeg({
                      legId: selectedLegId,
                      leg: {
                        crosswalk: true,
                        island: true,
                      },
                    }),
                  )
                }
              >
                מעבר חציה + מפרדה
              </button>
              <button
                onClick={() =>
                  dispatch(
                    setLeg({
                      legId: selectedLegId,
                      leg: {
                        crosswalk: false,
                        island: true,
                      },
                    }),
                  )
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
  leg,
  onClick,
  ariaLabel,
}: {
  leg: Leg | null
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
      className={`leg ${leg === null ? 'leg--placeholder' : ''} ${
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
      {leg?.crosswalk && (
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
      {leg?.island && (
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
