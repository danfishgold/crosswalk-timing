import { timedEventKey, TimedEventKey } from './Cycle/timedEvents'
import {
  CrosswalkId,
  CrosswalkKey,
  crosswalkKey,
  Cycle,
  DiagonalLeg,
  DiagonalLegId,
  diagonalLegIds,
  Junction,
  junctionCrosswalkIdsWithTrafficLights,
  MainLeg,
  MainLegId,
  mainLegIds,
  State,
} from './reducer'
import { zeroPad } from './utils'

export function encodeState(state: State): string {
  const {
    junctionTitle,
    junction,
    cycle,
    eventTimestamps,
    walkTimes,
    journeyIndexesString,
  } = state
  const crosswalkIds = junctionCrosswalkIdsWithTrafficLights(junction)

  const otherStuff = [
    encodeJunction(junction),
    encodeCycle(cycle),
    encodeTimestamps(eventTimestamps, crosswalkIds),
    encodeWalkTimes(walkTimes, crosswalkIds),
    encodeJourneyIndexesString(journeyIndexesString),
  ].join('|')

  return `${junctionTitle}/${squeeze(otherStuff)}`
}

export function decodeState(stateString: string): State | null {
  try {
    const urlParts = stateString.split('/')
    const junctionTitleString = urlParts.slice(0, -1).join('/')
    const squeezedOtherStuffString = urlParts[urlParts.length - 1]
    const otherStuffString = unsqueeze(squeezedOtherStuffString)

    const junctionTitle = decodeURI(junctionTitleString)
    const {
      junction,
      cycle,
      eventTimestamps,
      walkTimes,
      journeyIndexesString,
    } = decodeOtherStuff(otherStuffString)
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
      journeyIndexesString,
    }
  } catch (error) {
    if (import.meta.env.MODE !== 'test') {
      console.warn(error)
    }
    return null
  }
}

function decodeOtherStuff(
  otherStuffString: string,
): Pick<
  State,
  | 'junction'
  | 'cycle'
  | 'eventTimestamps'
  | 'walkTimes'
  | 'journeyIndexesString'
> {
  const [
    junctionString,
    cycleString,
    timestampsString,
    walkTimesString,
    journeyIndexesString,
  ] = otherStuffString.split('|')

  const junction = decodeJunction(junctionString)
  const crosswalkIds = junctionCrosswalkIdsWithTrafficLights(junction)
  const cycle = decodeCycle(cycleString)
  const eventTimestamps = decodeTimestamps(timestampsString, crosswalkIds)
  const walkTimes = decodeWalkTimes(walkTimesString, crosswalkIds)
  const decodedJourneyIndexesString =
    decodeJourneyIndexesString(journeyIndexesString)
  return {
    junction,
    cycle,
    eventTimestamps,
    walkTimes,
    journeyIndexesString: decodedJourneyIndexesString,
  }
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
  return Object.fromEntries(
    entries.filter(([key, walkTime]) => walkTime !== undefined),
  )
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
  return Object.fromEntries(
    entries.filter(([key, timestamps]) => timestamps.length > 0),
  )
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

function encodeJunction(junction: Junction): string {
  const mainLegs = parseInt(
    mainLegIds.map((id) => encodeMainLeg(junction[id]).toString()).join(''),
    5,
  )

  const diagonalLegs = parseInt(
    diagonalLegIds
      .map((id) => encodeDiagonalLeg(junction[id]).toString())
      .join(''),
    2,
  )
  return encodeNumberArray([mainLegs, diagonalLegs])
}

function encodeMainLeg(leg: MainLeg | null): number {
  if (!leg) {
    return 4
  }
  return parseInt(`${leg.crosswalk ? 1 : 0}${leg.island ? 1 : 0}`, 2)
}

function encodeDiagonalLeg(leg: DiagonalLeg | null): number {
  if (!leg) {
    return 0
  } else {
    return 1
  }
}

function decodeJunction(junctionString: string): Junction {
  const [mainLegsInBase10, diagonalLegsInBase10] =
    decodeNumberArray(junctionString)
  const mainLegs = Array.from(zeroPad(mainLegsInBase10.toString(5), 4)).map(
    (digit) => decodeMainLeg(parseInt(digit)),
  )
  const diagonalLegs = Array.from(
    zeroPad(diagonalLegsInBase10.toString(2), 4),
  ).map((digit) => decodeDiagonalLeg(parseInt(digit)))

  const mainLegEntries: [MainLegId, MainLeg | null][] = mainLegIds.map(
    (id: MainLegId, index: number) => [id, mainLegs[index]],
  )
  const diagonalLegEntries: [DiagonalLegId, DiagonalLeg | null][] =
    diagonalLegIds.map((id: DiagonalLegId, index: number) => [
      id,
      diagonalLegs[index],
    ])
  return Object.fromEntries([
    ...mainLegEntries,
    ...diagonalLegEntries,
  ]) as Junction
}

function decodeMainLeg(legValue: number): MainLeg | null {
  if (legValue === 4) {
    return null
  } else {
    const crosswalk = legValue >= 2
    const island = legValue % 2 === 1
    return { main: true, crosswalk, island }
  }
}

function decodeDiagonalLeg(legValue: number): DiagonalLeg | null {
  switch (legValue) {
    case 0:
      return null
    case 1:
      return { main: false, trafficLight: true }
    default:
      throw new Error(`Couldn't decode diagonal leg value ${legValue}`)
  }
}

// JOURNEY

function encodeJourneyIndexesString(indexesString: string): string {
  return indexesString.replaceAll(/\s*,\s*/g, '-').replaceAll(/\s+/g, ',')
}

function decodeJourneyIndexesString(str: string): string {
  return str.replaceAll(',', ' ').replaceAll('-', ', ')
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
  if (str === '') {
    return []
  }
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
  const modifiedBase64String = base64String
    .replaceAll(/=/g, '')
    .replaceAll(/\//g, '-')
    .replaceAll(/\+/g, '_')
  return modifiedBase64String
}

function unsqueeze(modifiedBase64String: string): string {
  const base64String = modifiedBase64String
    .replaceAll(/\-/g, '/')
    .replaceAll(/_/g, '+')
  const base16String = base64ToHex(base64String)
  const base13String = base16String // const base13String = parseInt(base16String, 16).toString(13)
  const string = Array.from(base13String)
    .map((character) => base13CharacterDecoding[character])
    .join('')
  return string
}
