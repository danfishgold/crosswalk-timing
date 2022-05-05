import {
  createSelector,
  createSlice,
  PayloadAction,
  Selector,
} from '@reduxjs/toolkit'
import { groupBy } from './utils'

export type State = {
  junction: Junction
  junctionTitle: string
  recordingDuration: number
  transitions: Transition[]
  cursor: Cursor | null
  transitionSuggestion: TransitionSuggestion | null
  cycle: Cycle | null
  timings: { crosswalkId: CrosswalkId; color: Color; offset: number }[]
}

export const legIds = ['n', 'e', 's', 'w'] as const
export type LegId = typeof legIds[number]

export type Junction = Record<LegId, Leg | null>

export type Leg = { crosswalk: boolean; island: boolean }

export type CrosswalkId = { legId: LegId; part?: 'first' | 'second' }

export type Transition = {
  id: string
  crosswalkId: CrosswalkId
  toColor: Color
  timestamp: number
}

export type Color = 'red' | 'green'

export type Cursor = {
  timestamp: number
  crosswalkId: CrosswalkId | null
}

export type TransitionSuggestion = {
  timestamp: number
  crosswalkId: CrosswalkId
  x: number
  y: number
}

export type Cycle = { duration: number; recordingOffset: number }

export type CrosswalkKey = LegId | `${LegId}-${'first' | 'second'}`
export function crosswalkKey(crosswalkId: CrosswalkId): CrosswalkKey {
  if (crosswalkId.part) {
    return `${crosswalkId.legId}-${crosswalkId.part}`
  } else {
    return crosswalkId.legId
  }
}

export type TransitionKey = `${CrosswalkKey}-${Color}`
export function transitionKey(
  crosswalkId: CrosswalkId,
  color: Color,
): TransitionKey {
  return `${crosswalkKey(crosswalkId)}-${color}`
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
  transitions: [],
  cursor: null,
  transitionSuggestion: null,
  cycle: null,
  timings: [],
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
  transitions: [
    {
      id: '0.12398773012577846',
      crosswalkId: { legId: 's', part: 'first' },
      timestamp: 61,
      toColor: 'red',
    },
    {
      id: '0.06205668256992425',
      crosswalkId: { legId: 's', part: 'first' },
      timestamp: 139,
      toColor: 'green',
    },
    {
      id: '0.6137002118351933',
      crosswalkId: { legId: 's', part: 'first' },
      timestamp: 149,
      toColor: 'red',
    },
    {
      id: '0.9071513331960934',
      crosswalkId: { legId: 's', part: 'second' },
      timestamp: 71,
      toColor: 'green',
    },
    {
      id: '0.793728302050524',
      crosswalkId: { legId: 's', part: 'second' },
      timestamp: 84,
      toColor: 'red',
    },
    {
      id: '0.5516136306987944',
      crosswalkId: { legId: 's', part: 'second' },
      timestamp: 161,
      toColor: 'green',
    },
    {
      id: '0.8799757999376338',
      crosswalkId: { legId: 's', part: 'second' },
      timestamp: 174,
      toColor: 'red',
    },
    {
      id: '0.8095581678087502',
      crosswalkId: { legId: 'w' },
      timestamp: 38,
      toColor: 'red',
    },
    {
      id: '0.8425316385763103',
      crosswalkId: { legId: 'w' },
      timestamp: 94,
      toColor: 'green',
    },
    {
      id: '0.7279889478335789',
      crosswalkId: { legId: 'w' },
      timestamp: 128,
      toColor: 'red',
    },
  ],
  cursor: null,
  transitionSuggestion: null,
  cycle: { duration: 90, recordingOffset: 44 },
  timings: [],
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

      state.transitions.push({
        id: Math.random().toString(),
        crosswalkId: state.transitionSuggestion.crosswalkId,
        timestamp: state.transitionSuggestion.timestamp,
        toColor: action.payload,
      })
      state.transitionSuggestion = null
      state.cursor = null
    },
    dismissTransitionSuggestion(state) {
      state.transitionSuggestion = null
      state.cursor = null
    },
    addTransitionThroughForm(
      state,
      action: PayloadAction<
        Pick<Transition, 'crosswalkId' | 'timestamp' | 'toColor'>
      >,
    ) {
      state.transitions.push({
        ...action.payload,
        id: Math.random().toString(),
      })
    },
    setCycleDuraration(state, action: PayloadAction<number>) {
      state.cycle = {
        duration: action.payload,
        recordingOffset: state.cycle?.recordingOffset ?? 0,
      }
    },
    setCycleOffset(state, action: PayloadAction<number>) {
      if (!state.cycle) {
        return
      }
      state.cycle.recordingOffset = action.payload
    },
  },
})

export default reducer

export const {
  setJunctionTitle,
  setLeg,
  setRecordingDuration,
  hoverOverTimeline,
  moveOutsideTimeline,
  clickTimelineTrack,
  confirmTransitionSuggestion,
  dismissTransitionSuggestion,
  addTransitionThroughForm,
  setCycleDuraration,
  setCycleOffset,
} = actions

export const selectCrosswalkTransitions = createSelector<
  [Selector<State, Transition[]>, Selector<State, CrosswalkId, [CrosswalkId]>],
  Transition[]
>(
  (state) => state.transitions,
  (_, crosswalkId) => crosswalkId,
  (transitions, crosswalkId) =>
    transitions
      .filter(
        (transition) =>
          transition.crosswalkId.legId === crosswalkId.legId &&
          transition.crosswalkId.part === crosswalkId.part,
      )
      .sort((a, b) => a.timestamp - b.timestamp),
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

export const selectIsCrosswalkSelected = createSelector(
  (state: State) => state.cursor?.crosswalkId,
  (state: State, crosswalkId: CrosswalkId) => crosswalkId,
  (selected, current) =>
    selected && crosswalkKey(selected) === crosswalkKey(current),
)

export const selectPossibleCycleDurations = createSelector(
  (state: State) => state.transitions,
  (transitions) => possibleCycleDurations(transitions),
)

function possibleCycleDurations(transitions: Transition[]): number[] {
  const transitionGroupings = groupBy(
    transitions,
    (transition) => crosswalkKey(transition.crosswalkId) + transition.toColor,
  )
  const allPossibleCycleDurations = Array.from(
    transitionGroupings.values(),
  ).flatMap(timestampDiffs)

  return allPossibleCycleDurations
}

function timestampDiffs(transitions: Transition[]): number[] {
  const timestamps = transitions.map((transition) => transition.timestamp)
  timestamps.sort((a, b) => a - b)
  return timestamps
    .slice(0, -1)
    .map((timestamp, index) => timestamps[index + 1] - timestamp)
}
