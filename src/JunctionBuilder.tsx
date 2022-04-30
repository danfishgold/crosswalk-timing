import React, { MouseEventHandler, useEffect, useMemo, useState } from 'react'
import {
  CrosswalkId,
  crosswalkIdString,
  Leg,
  LegId,
  legIds,
  selectCrosswalkIds,
  selectIsCrosswalkSelected,
  setJunctionTitle,
  setLeg,
} from './reducer'
import { useDispatch, useSelector } from './store'
import { range } from './utils'

// Sizes
const legWidth = 30
const legLength = 30
const crosswalkLength = 15
const crosswalkSegmentsInEachDirection = 3
const islandWidthInSegments = 2

// Derived sizes
const crosswalkSegmentCount =
  crosswalkSegmentsInEachDirection * 2 + islandWidthInSegments
const crosswalkSegmentLength = legWidth / (crosswalkSegmentCount * 2 + 1)
const islandY =
  crosswalkSegmentLength * (crosswalkSegmentsInEachDirection * 2 + 1)
const islandHeight = crosswalkSegmentLength * (islandWidthInSegments * 2 - 1)
const circleRadius = crosswalkSegmentLength * 1.5
const crosswalkOffset = islandHeight

const legRotation: Record<LegId, number> = {
  n: -90,
  e: 0,
  s: 90,
  w: 180,
}

export default function JunctionBuilder() {
  const dispatch = useDispatch()
  const junctionTitle = useSelector((state) => state.junctionTitle)

  const [inEditMode, setInEditMode] = useState(false)
  const [selectedLegId, setSelectedLegId] = useState<LegId | null>(null)

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
        junctionTitle && (
          <h1 style={{ textAlign: 'center' }}>{junctionTitle}</h1>
        )
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          maxWidth: '700px',
          margin: '0 auto',
        }}
      >
        <Svg
          inEditMode={inEditMode}
          onLegClick={(legId) => setSelectedLegId(legId)}
        />
        {inEditMode && (
          <div
            style={{
              maxWidth: '280px',
              border: '1px solid black',
              padding: '20px',
            }}
          >
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
    </div>
  )
}

function Svg({
  inEditMode,
  onLegClick,
}: {
  inEditMode: boolean
  onLegClick: (legId: LegId) => void
}) {
  const junction = useSelector((state) => state.junction)
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const viewBoxOffset = legWidth / 2 + legLength

  return (
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
          transform={`rotate(${legRotation[legId]}) translate(${legWidth / 2},${
            -legWidth / 2
          })`}
        >
          {(inEditMode || junction[legId]) && (
            <JunctionLegGroup
              leg={junction[legId]}
              onClick={inEditMode ? () => onLegClick(legId) : undefined}
              ariaLabel={junction[legId] ? 'עריכת כביש' : 'הוספת כביש'}
            />
          )}
        </g>
      ))}
      <g>
        {crosswalkIds.map((crosswalkId, index) => (
          <CrosswalkIndicatorGroup
            key={crosswalkIdString(crosswalkId)}
            crosswalkId={crosswalkId}
            index={index}
          />
        ))}
      </g>
    </svg>
  )
}

function CrosswalkIndicatorGroup({
  crosswalkId,
  index,
}: {
  crosswalkId: CrosswalkId
  index: number
}) {
  const isSelected = useSelector((state) =>
    selectIsCrosswalkSelected(state, crosswalkId),
  )

  const x = legWidth / 2 + crosswalkOffset
  const [y1, y2] = useMemo(() => {
    if (!crosswalkId.part) {
      const y1 = -legWidth / 2 + crosswalkSegmentLength
      const y2 = legWidth / 2 - crosswalkSegmentLength
      return [y1, y2]
    } else if (crosswalkId.part === 'first') {
      const y1 = -legWidth / 2 + crosswalkSegmentLength
      const y2 =
        -legWidth / 2 +
        crosswalkSegmentLength * (crosswalkSegmentsInEachDirection * 2)
      return [y1, y2]
    } else {
      const y1 =
        legWidth / 2 -
        crosswalkSegmentLength * (crosswalkSegmentsInEachDirection * 2)
      const y2 = legWidth / 2 - crosswalkSegmentLength
      return [y1, y2]
    }
  }, [crosswalkId.part])

  const color = isSelected ? 'lightsalmon' : 'white'
  return (
    <g transform={`rotate(${legRotation[crosswalkId.legId]})`}>
      <line
        x1={x}
        x2={x}
        y1={y1}
        y2={y2}
        stroke={color}
        strokeWidth={crosswalkSegmentLength}
      />
      <circle cx={x} cy={(y1 + y2) / 2} r={circleRadius} fill={color} />
      <text
        x={0}
        y={0}
        fontSize={crosswalkSegmentLength * 2.5}
        fill='black'
        textAnchor='middle'
        alignmentBaseline='middle'
        transform={`translate(${x}, ${(y1 + y2) / 2}) rotate(${-legRotation[
          crosswalkId.legId
        ]})`}
      >
        {index + 1}
      </text>
    </g>
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
      <rect className='road' x={0} y={0} width={legLength} height={legWidth} />
      {leg?.crosswalk && (
        <g className='crosswalk'>
          {range(crosswalkSegmentCount).map((segmentIndex) => (
            <rect
              className='crosswalk-stripe'
              key={segmentIndex}
              x={crosswalkOffset + circleRadius * 2}
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
            width={legLength}
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
      <rect
        className='leg__focus-ring'
        x={0}
        y={0}
        width={legLength}
        height={legWidth}
      />
    </g>
  )
}
