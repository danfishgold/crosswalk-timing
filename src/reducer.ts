import {
  createSelector,
  createSlice,
  PayloadAction,
  Selector,
} from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/internal'
import {
  canonicalTrackSegments,
  cycleDurationSuggestions,
  Segment,
  timedEventKey,
  TimedEventKey,
} from './Cycle/timedEvents'

export type State = {
  junction: Junction
  junctionTitle: string
  recordingDuration: number
  transitions: Record<string, Transition>
  cursor: Cursor | null
  transitionSuggestion: TransitionSuggestion | null
  cycle: Cycle | null
  eventTimestamps: Partial<Record<TimedEventKey, number[]>>
  inEditMode: boolean
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
  inEditMode: true,
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
  inEditMode: true,
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
  (junction): CrosswalkId[] =>
    legIds.flatMap((legId) => {
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
    }),
)

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
  Map<CrosswalkKey, Segment[] | null>
>(
  selectCrosswalkIds,
  (state) => state.cycle?.duration,
  (state) => state.eventTimestamps,
  (crosswalkIds, cycleDuration, eventTimestamps) => {
    if (!cycleDuration) {
      return new Map()
    }
    const entries: [CrosswalkKey, Segment[] | null][] = crosswalkIds.map(
      (id) => {
        const reds = eventTimestamps[timedEventKey(id, 'red')] ?? []
        const greens = eventTimestamps[timedEventKey(id, 'green')] ?? []
        const canonicalSegments = canonicalTrackSegments(
          reds,
          greens,
          cycleDuration,
        )
        return [crosswalkKey(id), canonicalSegments]
      },
    )
    return new Map(entries)
  },
)
