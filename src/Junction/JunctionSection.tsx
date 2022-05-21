import React, { useEffect, useState } from 'react'
import { LegId, setLeg } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { JunctionSvg as JunctionSvg } from './JunctionSvg'
import JunctionSvgAndCompanionWrapper from './JunctionSvgAndCompanionWrapper'

export default function JunctionBuilder() {
  const inEditMode = useSelector((state) => state.inEditMode)

  const [selectedLegId, setSelectedLegId] = useState<LegId | null>(null)

  useEffect(() => {
    setSelectedLegId(null)
  }, [inEditMode])

  return (
    <JunctionSvgAndCompanionWrapper>
      <JunctionSvg
        inEditMode={inEditMode}
        onLegClick={(legId) => setSelectedLegId(legId)}
      />
      <JunctionLegEditor
        selectedLegId={selectedLegId}
        css={{ flexBasis: '250px', flexGrow: 1 }}
      />
    </JunctionSvgAndCompanionWrapper>
  )
}

function JunctionLegEditor({
  selectedLegId,
  className,
}: {
  selectedLegId: LegId | null
  className?: string
}) {
  const dispatch = useDispatch()

  return (
    <div
      className={className}
      css={{
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
  )
}
