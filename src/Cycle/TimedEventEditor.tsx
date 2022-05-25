import { Button, ButtonGroup } from '@chakra-ui/button'
import { Heading } from '@chakra-ui/layout'
import { Tag } from '@chakra-ui/tag'
import React, { useEffect } from 'react'
import CrosswalkNumberIndicator from '../CrosswalkNumberIndicator'
import {
  crosswalkKey,
  Cycle,
  selectCrosswalkIds,
  setEventTimestamps,
} from '../reducer'
import { useDispatch, useSelector } from '../store'
import TimestampInput from '../TimestampInput'
import { formatTimestamp, range, sortBy, tally } from '../utils'
import { TimedEventKey, timedEventKey, timingSuggestions } from './timedEvents'

export default function TimedEventEditor({ cycle }: { cycle: Cycle }) {
  const crosswalkIds = useSelector(selectCrosswalkIds)
  const transitions = useSelector((state) => state.transitions)
  const eventTimingSuggestions = timingSuggestions(transitions, cycle)

  return (
    <div>
      <Heading as='h3' size='md'>
        תזמונים
      </Heading>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr 1fr',
          columnGap: '20px',
          rowGap: '10px',
        }}
      >
        <span />
        <div>
          <Tag colorScheme='green'>מעברים לירוק</Tag>
        </div>
        <div>
          <Tag colorScheme='red'>מעברים לאדום</Tag>
        </div>
        {crosswalkIds.map((id, index) => (
          <React.Fragment key={crosswalkKey(id)}>
            <CrosswalkNumberIndicator
              id={id}
              number={index + 1}
              withLegs={true}
            />
            <EventInputs
              eventKey={timedEventKey(id, 'green')}
              suggestions={
                eventTimingSuggestions[timedEventKey(id, 'green')] ?? []
              }
              inputCount={1}
            />
            <EventInputs
              eventKey={timedEventKey(id, 'red')}
              suggestions={
                eventTimingSuggestions[timedEventKey(id, 'red')] ?? []
              }
              inputCount={1}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function EventInputs({
  eventKey,
  suggestions,
  inputCount,
}: {
  eventKey: TimedEventKey
  suggestions: number[]
  inputCount: number
}) {
  const dispatch = useDispatch()
  const timestamps = useSelector(
    (state) => state.eventTimestamps[eventKey] ?? [],
  )
  const talliedSuggestions = sortBy(
    Array.from(tally(suggestions).entries()),
    ([, count]) => count,
  )

  useEffect(() => {
    dispatch(
      setEventTimestamps({
        eventKey,
        timestamps: timestamps?.slice(0, inputCount),
      }),
    )
  }, [inputCount])

  return (
    <div>
      {talliedSuggestions.length > 0 && (
        <ButtonGroup size='xs'>
          {talliedSuggestions.map(([timestamp, counts]) => {
            return (
              <Button
                key={timestamp}
                onClick={() =>
                  dispatch(
                    setEventTimestamps({ eventKey, timestamps: [timestamp] }),
                  )
                }
              >{`${formatTimestamp(
                timestamp,
              )} (הופיע ${counts} פעמים)`}</Button>
            )
          })}
        </ButtonGroup>
      )}

      {range(inputCount).map((index) => (
        <TimestampInput
          key={index}
          timestamp={timestamps[index] ?? null}
          setTimestamp={(timestamp) =>
            dispatch(
              setEventTimestamps({
                eventKey,
                timestamps: timestamp !== null ? [timestamp] : [],
              }),
            )
          }
        />
      ))}
    </div>
  )
}
