import { timedEventKey, TimedEventKey } from './Cycle/timedEvents'
import {
  CrosswalkId,
  CrosswalkKey,
  crosswalkKey,
  Cycle,
  Junction,
  junctionCrosswalkIds,
  Leg,
  LegId,
  legIds,
  State,
} from './reducer'

export function encodeState(state: State): string {
  const {
    junctionTitle,
    junction,
    cycle,
    eventTimestamps,
    walkTimes,
    journeyIndexes,
  } = state
  const crosswalkIds = junctionCrosswalkIds(junction)

  const otherStuff = [
    encodeJunction(junction),
    encodeCycle(cycle),
    encodeTimestamps(eventTimestamps, crosswalkIds),
    encodeWalkTimes(walkTimes, crosswalkIds),
    encodeJourneyIndexes(journeyIndexes),
  ].join('|')

  return `${nicerEncodeURI(junctionTitle)}/${squeeze(otherStuff)}`
}

export function decodeState(stateString: string): State | null {
  try {
    const urlParts = stateString.split('/')
    const junctionTitleString = urlParts.slice(0, -1).join('/')
    const squeezedOtherStuffString = urlParts[urlParts.length - 1]
    const otherStuffString = unsqueeze(squeezedOtherStuffString)

    const junctionTitle = decodeURI(junctionTitleString)
    const { junction, cycle, eventTimestamps, walkTimes } =
      decodeOtherStuff(otherStuffString)
    return {
      junctionTitle,
      junction,
      cycle,
      eventTimestamps,
      walkTimes,
      cursor: null,
      transitionSuggestion: null,
      recordingDuration: 180,
      transitions: {},
      inEditMode: false,
      journeyIndexes: [],
    }
  } catch (error) {
    console.warn(error)
    return null
  }
}

function decodeOtherStuff(
  otherStuffString: string,
): Pick<
  State,
  'junction' | 'cycle' | 'eventTimestamps' | 'walkTimes' | 'journeyIndexes'
> {
  const [
    junctionString,
    cycleString,
    timestampsString,
    walkTimesString,
    journeyIndexesString,
  ] = otherStuffString.split('|')

  const junction = decodeJunction(junctionString)
  const crosswalkIds = junctionCrosswalkIds(junction)
  const cycle = decodeCycle(cycleString)
  const eventTimestamps = decodeTimestamps(timestampsString, crosswalkIds)
  const walkTimes = decodeWalkTimes(walkTimesString, crosswalkIds)
  const journeyIndexes = decodeJourneyIndexes(journeyIndexesString)
  return { junction, cycle, eventTimestamps, walkTimes, journeyIndexes }
}

// WALK TIMES

function encodeWalkTimes(
  walkTimes: Partial<Record<CrosswalkKey, number>>,
  crosswalkIds: CrosswalkId[],
): string {
  return encodeOptionalNumberArray(
    crosswalkIds.map(crosswalkKey).map((key) => walkTimes[key]!),
  )
}

function decodeWalkTimes(
  walkTimesString: string,
  crosswalkIds: CrosswalkId[],
): Partial<Record<CrosswalkKey, number>> {
  const keys = crosswalkIds.map(crosswalkKey)
  const values = decodeOptionalNumberArray(walkTimesString)
  const entries: [CrosswalkKey, number | undefined][] = keys.map(
    (key, index) => [key, values[index]],
  )
  return Object.fromEntries(entries)
}

// TIMESTAMPS

function encodeTimestamps(
  timestamps: Partial<Record<TimedEventKey, number[]>>,
  crosswalkIds: CrosswalkId[],
): string {
  return crosswalkIds
    .flatMap((id) => [timedEventKey(id, 'green'), timedEventKey(id, 'red')])
    .map((eventKey) => encodeNumberArray(timestamps[eventKey] ?? []))
    .join('-')
}

function decodeTimestamps(
  timestampsString: string,
  crosswalkIds: CrosswalkId[],
): Partial<Record<TimedEventKey, number[]>> {
  const keys = crosswalkIds.flatMap((id) => [
    timedEventKey(id, 'green'),
    timedEventKey(id, 'red'),
  ])
  const values = timestampsString.split('-').map(decodeNumberArray)

  const entries: [TimedEventKey, number[]][] = keys.map((eventKey, index) => [
    eventKey,
    values[index],
  ])
  return Object.fromEntries(entries)
}

// CYCLE

function encodeCycle(cycle: Cycle | null): string {
  if (!cycle) {
    return ''
  }
  return encodeNumberArray([cycle.duration, cycle.offset])
}

function decodeCycle(cycleString: string): Cycle | null {
  if (cycleString === '') {
    return null
  }
  const [duration, offset] = decodeNumberArray(cycleString)
  return { duration, offset }
}

// JUNCTION

/// max: 6^4 - 1 = 1295
function encodeJunction(junction: Junction): string {
  return parseInt(
    legIds.map((id) => encodeLeg(junction[id]).toString()).join(''),
    6,
  ).toString()
}

function encodeLeg(leg: Leg | null): number {
  if (!leg) {
    return 5
  }
  return parseInt(`${leg.crosswalk ? 1 : 0}${leg.island ? 1 : 0}`, 2)
}

function decodeJunction(junctionString: string): Junction {
  const legs = Array.from(parseInt(junctionString).toString(6)).map((digit) =>
    decodeLeg(parseInt(digit)),
  )
  const entries: [LegId, Leg | null][] = legIds.map((id: LegId, index) => [
    id,
    legs[index],
  ])
  return Object.fromEntries(entries) as Junction
}

function decodeLeg(legValue: number): Leg | null {
  if (legValue === 5) {
    return null
  } else {
    const crosswalk = legValue >= 2
    const island = legValue % 2 === 1
    return { crosswalk, island }
  }
}

// JOURNEY

function encodeJourneyIndexes(indexes: number[][]): string {
  return indexes.map((journey) => encodeNumberArray(journey)).join('-')
}

function decodeJourneyIndexes(str: string): number[][] {
  return str.split('-').map((journeyString) => decodeNumberArray(journeyString))
}

// HELPERS

function encodeNumberArray(array: number[]): string {
  return array.map((item) => item.toString()).join(',')
}

function encodeOptionalNumberArray(array: (number | undefined)[]): string {
  return array
    .map((item) => (item === undefined ? '' : item.toString()))
    .join(',')
}

function decodeNumberArray(str: string): number[] {
  return str.split(',').map((numberString) => parseInt(numberString))
}
function decodeOptionalNumberArray(str: string): (number | undefined)[] {
  return str
    .split(',')
    .map((item) => (item === '' ? undefined : parseInt(item)))
}

function hexToBase64(hexString: string): string {
  const paddedHexString =
    hexString.length % 2 === 0 ? hexString : '0' + hexString
  const charCodes = paddedHexString
    .match(/\w{2}/g)!
    .map((pair) => parseInt(pair, 16))

  return btoa(String.fromCharCode(...charCodes))
}

function base64ToHex(b64String: string): string {
  const charCodesAsHex = Array.from(atob(b64String)).map((character) =>
    character.charCodeAt(0).toString(16),
  )
  const paddedBase16String = charCodesAsHex
    .map((b16Char) => (b16Char.length === 2 ? b16Char : '0' + b16Char))
    .join('')
  return paddedBase16String
}

const base13CharacterEnoding: Record<string, string> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  ',': 'a',
  '|': 'b',
  '-': 'c',
}

const base13CharacterDecoding: Record<string, string> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  a: ',',
  b: '|',
  c: '-',
}

function squeeze(stateString: string): string {
  const base13String = Array.from(stateString)
    .map((character) => base13CharacterEnoding[character])
    .join('')
  const base16String = base13String // const base16String = parseInt(base13String, 13).toString(16)
  const base64String = hexToBase64(base16String)
  return base64String.replace(/=/g, '').replace(/\//g, '-').replace(/\+/g, '_')
}

function unsqueeze(base64String: string): string {
  const base16String = base64ToHex(base64String)
  const base13String = base16String // const base13String = parseInt(base16String, 16).toString(13)
  const string = Array.from(base13String)
    .map((character) => base13CharacterDecoding[character])
    .join('')
  return string.replace(/\-/g, '/').replace(/_/g, '+')
}

function nicerEncodeURI(stringWithHebrew: string): string {
  return [...stringWithHebrew]
    .map((character) =>
      /[א-תףםןץך]/.test(character) ? character : encodeURI(character),
    )
    .join('')
}
