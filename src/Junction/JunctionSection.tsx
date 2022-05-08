import React, { useEffect, useState } from 'react'
import { LegId, setJunctionTitle, setLeg } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { JunctionSvg as JunctionSvg } from './JunctionSvg'

export default function JunctionBuilder() {
  const dispatch = useDispatch()
  const inEditMode = useSelector((state) => state.inEditMode)

  const [selectedLegId, setSelectedLegId] = useState<LegId | null>(null)

  useEffect(() => {
    setSelectedLegId(null)
  }, [inEditMode])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        maxWidth: '700px',
        margin: '0 auto',
      }}
    >
      <JunctionSvg
        inEditMode={inEditMode}
        onLegClick={(legId) => setSelectedLegId(legId)}
      />
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
    </div>
  )
}
