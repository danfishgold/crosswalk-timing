import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export type State = {
  junction: Junction
  junctionTitle: string
  recordingDuration: number
  transitions: Transition[]
  cursor: Cursor | null
  transitionSuggestion: TransitionSuggestion | null
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

export function crosswalkIdString(crosswalkId: CrosswalkId): string {
  if (crosswalkId.part) {
    return `${crosswalkId.legId}-${crosswalkId.part}`
  } else {
    return crosswalkId.legId
  }
}

const initialState: State = {
  junction: {
    n: { crosswalk: false, island: true },
    e: null,
    s: { crosswalk: true, island: true },
    w: { crosswalk: true, island: false },
  },
  junctionTitle: '',
  recordingDuration: 60,
  transitions: [],
  cursor: null,
  transitionSuggestion: null,
}

const { reducer, actions } = createSlice({
  name: 'reducer',
  initialState,
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
    hoverOverTimeline(state, action: PayloadAction<number>) {
      if (state.transitionSuggestion) {
        return
      }
      state.cursor = { timestamp: action.payload, crosswalkId: null }
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
} = actions

export const selectTrackTransitions = createSelector(
  (state: State) => state.transitions,
  (state: State, crosswalkId: CrosswalkId) => crosswalkId,
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
