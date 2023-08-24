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
      junctionTitle: 'A title',
      junction: {
        n: { main: true, island: false, crosswalk: true },
        e: null,
        s: null,
        w: null,
        ne: null,
        nw: null,
        se: null,
        sw: null,
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
