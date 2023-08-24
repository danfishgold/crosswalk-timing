import { describe, expect, test } from 'vitest'
import { szoldState } from './reducer'
// import { State } from './reducer'
import { decodeState, encodeState } from './stateCoding'

describe('Encoding > Decoding', () => {
  test('The main bits of the state are the same', () => {
    const state = szoldState
    const parsedState = decodeState(encodeState(state))!
    expect(state.junction).toStrictEqual(parsedState.junction)
    expect(state.junctionTitle).toStrictEqual(parsedState.junctionTitle)
    expect(state.eventTimestamps).toStrictEqual(parsedState.eventTimestamps)
    expect(state.cycle).toStrictEqual(parsedState.cycle)
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
