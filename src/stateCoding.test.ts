import _ from 'lodash'
import { describe, expect, test } from 'vitest'
import { emptyState, szoldState } from './reducer'
// import { State } from './reducer'
import { decodeState, encodeState } from './stateCoding'
import { State } from './store'

describe('Encoding > Decoding', () => {
  test('The main bits of the state are the same', () => {
    const state = szoldState
    const parsedState = decodeState(encodeState(state))!
    expect(_.omit(state, ['inEditMode', 'transitions'])).toStrictEqual(
      _.omit(parsedState, ['inEditMode', 'transitions']),
    )
  })

  test('A pretty empty state stays the same', () => {
    const state: State = {
      ...emptyState,
      junction: {
        ...emptyState.junction,
        n: { main: true, crosswalk: true, island: false },
        e: { main: true, crosswalk: true, island: false },
        ne: { main: false, trafficLight: true },
      },
    }
    const parsedState = decodeState(encodeState(state))!
    expect(_.omit(state, ['inEditMode', 'transitions'])).toStrictEqual(
      _.omit(parsedState, ['inEditMode', 'transitions']),
    )
  })
})

describe('Decoding > Encoding', () => {
  test('The encoded string is the same', () => {
    const encodedState =
      'ארלוזורוב/הנרייטה סולד/JCoLkKRLScYcSchMTDi5p6exoqPDoqE'
    const decodedState = decodeState(encodedState)
    expect(decodedState).not.toBeNull()
    const reencodedState = encodeState(decodedState!)
    expect(encodedState).toEqual(reencodedState)
  })

  test('The encoded string is the same (2)', () => {
    const encodedState =
      'ארלוזורוב/הנרייטה סולד/JCoLkKRLScYccchMTDi5p6exoqPDoqE'
    const decodedState = decodeState(encodedState)
    expect(decodedState).not.toBeNull()
    const reencodedState = encodeState(decodedState!)
    expect(encodedState).toEqual(reencodedState)
  })
})
