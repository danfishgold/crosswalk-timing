import { Button } from '@chakra-ui/button'
import { Heading, HStack, VStack } from '@chakra-ui/layout'
import { useMemo } from 'react'
import {
  deleteTransitionFromList,
  makeSelectCrosswalkTransitionsAndIds,
  selectCrosswalkIdsWithTrafficLights,
  updateTransitionInList,
} from '../reducer'
import { CrosswalkId, crosswalkKey } from '../state'
import { useDispatch, useSelector } from '../store'
import { CrosswalkNumberIndicator } from './../CrosswalkNumberIndicator'
import { ColorSwitcher, TimestampField } from './TransitionFormElements'

export function TransitionList() {
  const crosswalkIds = useSelector(selectCrosswalkIdsWithTrafficLights)

  return (
    <VStack align='start' spacing='10px'>
      <Heading as='h3' size='md'>
        רשימת המעברים בהקלטה
      </Heading>
      {crosswalkIds.map((id, index) => (
        <CrosswalkTransitionList
          key={crosswalkKey(id)}
          crosswalkId={id}
          index={index}
        />
      ))}
    </VStack>
  )
}

function CrosswalkTransitionList({
  crosswalkId,
  index,
}: {
  crosswalkId: CrosswalkId
  index: number
}) {
  const selectCrosswalkTransitionsAndIds = useMemo(
    makeSelectCrosswalkTransitionsAndIds,
    [],
  )

  const transitions = useSelector((state) =>
    selectCrosswalkTransitionsAndIds(state, crosswalkId),
  )

  return (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '10px',
        minHeight: '50px',
        padding: '5px 5px',
      }}
    >
      <CrosswalkNumberIndicator id={crosswalkId} number={index + 1} />
      <div>
        {transitions.length > 0 ? (
          transitions.map(([id]) => <TransitionRow key={id} id={id} />)
        ) : (
          <p>עוד אין תזמונים במעבר החציה הזה. אפשר להוסיף מעברים בחלק למעלה.</p>
        )}
      </div>
    </div>
  )
}

function TransitionRow({ id }: { id: string }) {
  const dispatch = useDispatch()
  const transition = useSelector((state) => state.transitions[id])

  const onDeleteClick = () => {
    if (window.confirm('בטוח למחוק?')) {
      dispatch(deleteTransitionFromList(id))
    }
  }
  return (
    <HStack align='flex-end' spacing='20px'>
      <HStack>
        <TimestampField
          timestamp={transition.timestamp}
          setTimestamp={(timestamp) => {
            if (timestamp !== null) {
              dispatch(
                updateTransitionInList({
                  id,
                  transition: { ...transition, timestamp },
                }),
              )
            }
          }}
        />
        <ColorSwitcher
          selectedColor={transition.toColor}
          setSelectedColor={(toColor) =>
            dispatch(
              updateTransitionInList({
                id,
                transition: { ...transition, toColor },
              }),
            )
          }
        />
      </HStack>
      <Button size='sm' onClick={onDeleteClick}>
        מחיקה
      </Button>
    </HStack>
  )
}
