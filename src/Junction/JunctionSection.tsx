import { Button } from '@chakra-ui/button'
import { Heading, VStack } from '@chakra-ui/layout'
import { useEffect, useState } from 'react'
import { isMainLegId, LegId, setLeg } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { JunctionSvg } from './JunctionSvg'
import JunctionSvgAndCompanionWrapper from './JunctionSvgAndCompanionWrapper'

export default function JunctionSection() {
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
      <Heading as='h2' size='lg'>
        עריכת צומת
      </Heading>
      {selectedLegId === null ? (
        <p>לחצו על אחת הזרועות של הצומת כדי לערוך אותה</p>
      ) : isMainLegId(selectedLegId) ? (
        <VStack align='start'>
          <Button
            size='sm'
            onClick={() =>
              dispatch(setLeg({ legId: selectedLegId, leg: null }))
            }
          >
            שום כלום
          </Button>
          <Button
            size='sm'
            onClick={() =>
              dispatch(
                setLeg({
                  legId: selectedLegId,
                  leg: {
                    main: true,
                    crosswalk: false,
                    island: false,
                  },
                }),
              )
            }
          >
            כביש בלי מעבר חציה
          </Button>
          <Button
            size='sm'
            onClick={() =>
              dispatch(
                setLeg({
                  legId: selectedLegId,
                  leg: { main: true, crosswalk: true, island: false },
                }),
              )
            }
          >
            מעבר חציה
          </Button>
          <Button
            size='sm'
            onClick={() =>
              dispatch(
                setLeg({
                  legId: selectedLegId,
                  leg: { main: true, crosswalk: true, island: true },
                }),
              )
            }
          >
            מעבר חציה + מפרדה
          </Button>
          <Button
            size='sm'
            onClick={() =>
              dispatch(
                setLeg({
                  legId: selectedLegId,
                  leg: { main: true, crosswalk: false, island: true },
                }),
              )
            }
          >
            בלי מעבר חציה אבל עם מפרדה
          </Button>
        </VStack>
      ) : (
        <VStack align='start'>
          <Button
            size='sm'
            onClick={() =>
              dispatch(setLeg({ legId: selectedLegId, leg: null }))
            }
          >
            שום כלום
          </Button>
          <Button
            size='sm'
            onClick={() =>
              dispatch(
                setLeg({
                  legId: selectedLegId,
                  leg: {
                    main: false,
                    trafficLight: true,
                  },
                }),
              )
            }
          >
            מעבר חציה
          </Button>
        </VStack>
      )}
    </div>
  )
}
