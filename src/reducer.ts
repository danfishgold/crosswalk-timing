import {
  createSelector,
  createSlice,
  PayloadAction,
  Selector
} from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/internal'
import {
  canonicalTrackSegments,
  cycleDurationSuggestions,
  Segment,
  timedEventKey,
  TimedEventKey
} from './Cycle/timedEvents'
import { canonicalWaitTimes } from './Simulation/waitTimes'
import { compact } from './utils'

export type State = {
  junction: Junction
  junctionTitle: string
  recordingDuration: number
  transitions: Record<string, Transition>
  cursor: Cursor | null
  transitionSuggestion: TransitionSuggestion | null
  cycle: Cycle | null
  eventTimestamps: Partial<Record<TimedEventKey, number[]>>
  walkTimes: Partial<Record<CrosswalkKey, number>>
  inEditMode: boolean
  journeyIndexes: number[]
}

export const legIds = ['n', 'e', 's', 'w'] as const
export type LegId = typeof legIds[number]

export type Junction = Record<LegId, Leg | null>

export type Leg = { crosswalk: boolean; island: boolean }

export type CrosswalkId = { legId: LegId; part?: 'first' | 'second' }

export type Transition = {
  crosswalkId: CrosswalkId
  toColor: Color
  timestamp: number
}

export type Color = 'red' | 'green'
export type Highlight = Color | 'highlight'

export type Cursor = {
  timestamp: number
  crosswalkId: CrosswalkId | null
}

export type TransitionSuggestion = {
  id?: string
  timestamp: number
  crosswalkId: CrosswalkId
  x: number
  y: number
}

export type Cycle = { duration: number; offset: number }

export type CrosswalkKey = LegId | `${LegId}-${'first' | 'second'}`
export function crosswalkKey(crosswalkId: CrosswalkId): CrosswalkKey {
  if (crosswalkId.part) {
    return `${crosswalkId.legId}-${crosswalkId.part}`
  } else {
    return crosswalkId.legId
  }
}

const emptyState: State = {
  junction: {
    n: null,
    e: null,
    s: null,
    w: null,
  },
  junctionTitle: '',
  recordingDuration: 180,
  transitions: {},
  cursor: null,
  transitionSuggestion: null,
  cycle: null,
  eventTimestamps: {},
  walkTimes: {},
  inEditMode: true,
  journeyIndexes: [],
}

const szoldState: State = {
  junction: {
    n: { crosswalk: false, island: true },
    e: null,
    s: { crosswalk: true, island: true },
    w: { crosswalk: true, island: false },
  },
  junctionTitle: 'ארלוזורוב/הנרייטה סולד',
  recordingDuration: 180,
  transitions: {
    '0.12398773012577846': {
      crosswalkId: { legId: 's', part: 'first' },
      timestamp: 61,
      toColor: 'red',
    },
    '0.06205668256992425': {
      crosswalkId: { legId: 's', part: 'first' },
      timestamp: 139,
      toColor: 'green',
    },
    '0.6137002118351933': {
      crosswalkId: { legId: 's', part: 'first' },
      timestamp: 149,
      toColor: 'red',
    },
    '0.9071513331960934': {
      crosswalkId: { legId: 's', part: 'second' },
      timestamp: 71,
      toColor: 'green',
    },
    '0.793728302050524': {
      crosswalkId: { legId: 's', part: 'second' },
      timestamp: 84,
      toColor: 'red',
    },
    '0.5516136306987944': {
      crosswalkId: { legId: 's', part: 'second' },
      timestamp: 161,
      toColor: 'green',
    },
    '0.8799757999376338': {
      crosswalkId: { legId: 's', part: 'second' },
      timestamp: 174,
      toColor: 'red',
    },
    '0.8095581678087502': {
      crosswalkId: { legId: 'w' },
      timestamp: 38,
      toColor: 'red',
    },
    '0.8425316385763103': {
      crosswalkId: { legId: 'w' },
      timestamp: 94,
      toColor: 'green',
    },
    '0.7279889478335789': {
      crosswalkId: { legId: 'w' },
      timestamp: 128,
      toColor: 'red',
    },
  },
  cursor: null,
  transitionSuggestion: null,
  cycle: { duration: 90, offset: 44 },
  eventTimestamps: {
    'w-green': [4],
    'w-red': [38],
    's-first-green': [49],
    's-first-red': [61],
    's-second-green': [71],
    's-second-red': [84],
  },
  walkTimes: {
    w: 7,
    's-first': 9,
    's-second': 7,
  },
  inEditMode: false,
  journeyIndexes: [0, 1, 2],
}

const weizmannState: State = {
  junction: {
    n: { crosswalk: true, island: true },
    e: { crosswalk: true, island: true },
    s: { crosswalk: true, island: true },
    w: { crosswalk: true, island: true },
  },
  junctionTitle: 'ארלוזורוב/ויצמן',
  recordingDuration: 399,
  transitions: {
    '0.5223888119273669': {
      timestamp: 35,
      crosswalkId: { legId: 'n', part: 'first' },
      toColor: 'green',
    },
    '0.7534059214753597': {
      timestamp: 37,
      crosswalkId: { legId: 'n', part: 'second' },
      toColor: 'green',
    },
    '0.42789173422594307': {
      timestamp: 51,
      crosswalkId: { legId: 'n', part: 'first' },
      toColor: 'red',
    },
    '0.4910721850368728': {
      timestamp: 60,
      crosswalkId: { legId: 'n', part: 'second' },
      toColor: 'red',
    },
    '0.019021264114906233': {
      timestamp: 125,
      crosswalkId: { legId: 'n', part: 'first' },
      toColor: 'green',
    },
    '0.5901882857959485': {
      timestamp: 127,
      crosswalkId: { legId: 'n', part: 'second' },
      toColor: 'green',
    },
    '0.0713502050993875': {
      timestamp: 147,
      crosswalkId: { legId: 'e', part: 'second' },
      toColor: 'red',
    },
    '0.5288307101029167': {
      timestamp: 150,
      crosswalkId: { legId: 'e', part: 'first' },
      toColor: 'green',
    },
    '0.3696954515072949': {
      timestamp: 193,
      crosswalkId: { legId: 'e', part: 'second' },
      toColor: 'green',
    },
    '0.48580480924008884': {
      timestamp: 202,
      crosswalkId: { legId: 'e', part: 'first' },
      toColor: 'red',
    },
    '0.20179185833384095': {
      timestamp: 236,
      crosswalkId: { legId: 'e', part: 'second' },
      toColor: 'red',
    },
    '0.9901914862470048': {
      timestamp: 243,
      crosswalkId: { legId: 's', part: 'first' },
      toColor: 'green',
    },
    '0.46491366153151437': {
      timestamp: 244,
      crosswalkId: { legId: 's', part: 'second' },
      toColor: 'green',
    },
    '0.04853160026547032': {
      timestamp: 271,
      crosswalkId: { legId: 's', part: 'first' },
      toColor: 'red',
    },
    '0.1410476561303039': {
      timestamp: 273,
      crosswalkId: { legId: 's', part: 'second' },
      toColor: 'red',
    },
    '0.5753717319694281': {
      timestamp: 281,
      crosswalkId: { legId: 'w', part: 'first' },
      toColor: 'green',
    },
    '0.7199638828397977': {
      timestamp: 296,
      crosswalkId: { legId: 'w', part: 'second' },
      toColor: 'red',
    },
    '0.2979234493538847': {
      timestamp: 396,
      crosswalkId: { legId: 'n', part: 'second' },
      toColor: 'green',
    },
    '0.7290582020914632': {
      timestamp: 394,
      crosswalkId: { legId: 'n', part: 'first' },
      toColor: 'green',
    },
    '0.02871591746746094': {
      crosswalkId: { legId: 'w', part: 'first' },
      timestamp: 321,
      toColor: 'red',
    },
    '0.8512535069566213': {
      crosswalkId: { legId: 'w', part: 'second' },
      timestamp: 272,
      toColor: 'green',
    },
  },
  cursor: null,
  transitionSuggestion: null,
  cycle: { duration: 90, offset: 28 },
  eventTimestamps: {
    'n-first-green': [34],
    'n-first-red': [51],
    'n-second-green': [36],
    'n-second-red': [60],
    'e-first-green': [60],
    'e-first-red': [22],
    'e-second-green': [13],
    'e-second-red': [57],
    's-first-green': [63],
    's-first-red': [1],
    's-second-green': [64],
    's-second-red': [3],
    'w-first-green': [11],
    'w-first-red': [51],
    'w-second-green': [2],
    'w-second-red': [26],
  },
  walkTimes: {
    'n-first': 7,
    'n-second': 7,
    'e-first': 7,
    'e-second': 7,
    's-first': 7,
    's-second': 7,
    'w-first': 7,
    'w-second': 7,
  },
  inEditMode: false,
  journeyIndexes: [],
}

const { reducer, actions } = createSlice({
  name: 'reducer',
  initialState: szoldState,
  reducers: {
    setJunctionTitle(state, action: PayloadAction<string>) {
      state.junctionTitle = action.payload
    },
    setLeg(state, action: PayloadAction<{ legId: LegId; leg: Leg | null }>) {
      state.junction[action.payload.legId] = action.payload.leg
    },
    setRecordingDuration(state, action: PayloadAction<number>) {
      state.recordingDuration = action.payload
    },
    hoverOverTimeline(
      state,
      action: PayloadAction<{ timestamp: number; crosswalkId?: CrosswalkId }>,
    ) {
      if (state.transitionSuggestion) {
        return
      }
      state.cursor = {
        timestamp: action.payload.timestamp,
        crosswalkId: action.payload.crosswalkId ?? null,
      }
    },
    moveOutsideTimeline(state) {
      if (state.transitionSuggestion) {
        return
      }
      state.cursor = null
    },
    clickTimelineTrack(
      state,
      action: PayloadAction<{
        crosswalkId: CrosswalkId
        timestamp: number
        x: number
        y: number
      }>,
    ) {
      state.transitionSuggestion = {
        crosswalkId: action.payload.crosswalkId,
        timestamp: action.payload.timestamp,
        x: action.payload.x,
        y: action.payload.y,
      }
      state.cursor = {
        crosswalkId: action.payload.crosswalkId,
        timestamp: action.payload.timestamp,
      }
    },
    confirmTransitionSuggestion(state, action: PayloadAction<Color>) {
      if (!state.transitionSuggestion) {
        return
      }

      const transition = {
        crosswalkId: state.transitionSuggestion.crosswalkId,
        timestamp: state.transitionSuggestion.timestamp,
        toColor: action.payload,
      }

      upsertTransition(
        state.transitions,
        transition,
        state.transitionSuggestion.id,
      )
      state.transitionSuggestion = null
      state.cursor = null
    },
    cancelTransitionSuggestion(state) {
      if (state.transitionSuggestion?.id) {
        delete state.transitions[state.transitionSuggestion.id]
      }
      state.transitionSuggestion = null
      state.cursor = null
    },
    clickOnExistingTransition(
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>,
    ) {
      const transition = state.transitions[action.payload.id]
      if (!transition) {
        return
      }
      state.transitionSuggestion = {
        id: action.payload.id,
        timestamp: transition.timestamp,
        crosswalkId: transition.crosswalkId,
        x: action.payload.x,
        y: action.payload.y,
      }
    },
    addTransitionThroughForm(state, action: PayloadAction<Transition>) {
      upsertTransition(state.transitions, action.payload)
    },
    updateTransitionInList(
      state,
      action: PayloadAction<{ id: string; transition: Transition }>,
    ) {
      upsertTransition(
        state.transitions,
        action.payload.transition,
        action.payload.id,
      )
    },
    deleteTransitionFromList(state, action: PayloadAction<string>) {
      delete state.transitions[action.payload]
    },
    setCycleDuraration(state, action: PayloadAction<number>) {
      state.cycle = {
        duration: action.payload,
        offset: state.cycle?.offset ?? 0,
      }
    },
    setCycleOffset(state, action: PayloadAction<number>) {
      if (!state.cycle) {
        return
      }
      state.cycle.offset = action.payload
    },
    toggleEditMode(state) {
      state.inEditMode = !state.inEditMode
    },
    setEventTimestamps(
      state,
      action: PayloadAction<{ eventKey: TimedEventKey; timestamps: number[] }>,
    ) {
      state.eventTimestamps[action.payload.eventKey] = action.payload.timestamps
    },
    setCrosswalkWalkTime(
      state,
      action: PayloadAction<{ crosswalkKey: CrosswalkKey; duration: number }>,
    ) {
      state.walkTimes[action.payload.crosswalkKey] = action.payload.duration
    },
    setJourneyIndexes(state, action: PayloadAction<number[]>) {
      state.journeyIndexes = action.payload
    },
    replaceEntireState(state, action: PayloadAction<State>) {
      return action.payload
    },
    resetState(state) {
      return { ...emptyState, inEditMode: true }
    },
  },
})

function upsertTransition(
  transitions: WritableDraft<Record<string, Transition>>,
  transition: Transition,
  existingId?: string,
): string {
  const existingTransitionId =
    existingId ??
    Object.keys(transitions).find(
      (id) =>
        crosswalkKey(transitions[id].crosswalkId) ===
          crosswalkKey(transition.crosswalkId) &&
        transitions[id].timestamp === transition.timestamp,
    )
  const id = existingTransitionId ?? Math.random().toString()
  transitions[id] = transition
  return id
}

export default reducer

export const {
  setJunctionTitle,
  setLeg,
  setRecordingDuration,
  hoverOverTimeline,
  moveOutsideTimeline,
  clickTimelineTrack,
  confirmTransitionSuggestion,
  cancelTransitionSuggestion,
  clickOnExistingTransition,
  addTransitionThroughForm,
  updateTransitionInList,
  deleteTransitionFromList,
  setCycleDuraration,
  setCycleOffset,
  toggleEditMode,
  setEventTimestamps,
  setCrosswalkWalkTime,
  setJourneyIndexes,
  replaceEntireState,
  resetState,
} = actions

export const selectCrosswalkTransitionsAndIds = createSelector<
  [
    Selector<State, Record<string, Transition>>,
    Selector<State, CrosswalkId, [CrosswalkId]>,
  ],
  [string, Transition][]
>(
  (state) => state.transitions,
  (_, crosswalkId) => crosswalkId,
  (transitions, crosswalkId) =>
    Object.entries(transitions)
      .filter(
        ([transitionId, transition]) =>
          transition.crosswalkId.legId === crosswalkId.legId &&
          transition.crosswalkId.part === crosswalkId.part,
      )
      .sort(([, a], [, b]) => a.timestamp - b.timestamp),
)

export const selectCrosswalkIds = createSelector(
  (state: State) => state.junction,
  junctionCrosswalkIds,
)

export function junctionCrosswalkIds(junction: Junction): CrosswalkId[] {
  return legIds.flatMap((legId) => {
    const leg = junction[legId]
    if (!leg || !leg.crosswalk) {
      return []
    }
    if (leg.island) {
      return [
        { legId: legId as LegId, part: 'first' },
        { legId: legId as LegId, part: 'second' },
      ]
    }
    return [{ legId: legId as LegId }]
  })
}

export const selectCycleDurationSuggestions = createSelector(
  (state: State) => state.transitions,
  (transitions) => cycleDurationSuggestions(transitions),
)

export const selectCrosswalkHighlightColors = createSelector<
  [Selector<State, CrosswalkId[]>, Selector<State, Cursor | null>],
  Record<CrosswalkKey, Highlight | null>
>(selectCrosswalkIds, (state) => state.cursor, crosswalkHighlightColors)

function crosswalkHighlightColors(
  crosswalkIds: CrosswalkId[],
  cursor: Cursor | null,
): Record<CrosswalkKey, Highlight | null> {
  const entries = crosswalkIds.map((id) => {
    const key = crosswalkKey(id)
    if (cursor?.crosswalkId && crosswalkKey(cursor.crosswalkId) === key) {
      return [key, 'highlight']
    } else {
      return [key, null]
    }
  })
  return Object.fromEntries(entries)
}

export const selectCanonicalCycleSegments = createSelector<
  [
    Selector<State, CrosswalkId[]>,
    Selector<State, number | undefined>,
    Selector<State, Partial<Record<TimedEventKey, number[]>>>,
  ],
  Map<CrosswalkKey, Segment[]>
>(
  selectCrosswalkIds,
  (state) => state.cycle?.duration,
  (state) => state.eventTimestamps,
  (crosswalkIds, cycleDuration, eventTimestamps) => {
    if (!cycleDuration) {
      return new Map()
    }
    const entries: [CrosswalkKey, Segment[]][] = compact(
      crosswalkIds.map((id) => {
        const reds = eventTimestamps[timedEventKey(id, 'red')] ?? []
        const greens = eventTimestamps[timedEventKey(id, 'green')] ?? []
        const canonicalSegments = canonicalTrackSegments(
          reds,
          greens,
          cycleDuration,
        )
        if (!canonicalSegments) {
          return null
        }
        return [crosswalkKey(id), canonicalSegments]
      }),
    )
    return new Map(entries)
  },
)

export const selectCanonicalWaitTimes = createSelector<
  [
    Selector<State, Map<CrosswalkKey, Segment[]>>,
    Selector<State, number | undefined>,
  ],
  Map<CrosswalkKey, number[]>
>(
  selectCanonicalCycleSegments,
  (state) => state.cycle?.duration,
  (segments, cycleDuration) => {
    if (!cycleDuration) {
      return new Map()
    }
    return new Map(
      Array.from(segments.entries()).map(([key, segments]) => [
        key,
        canonicalWaitTimes(segments, cycleDuration),
      ]),
    )
  },
)
