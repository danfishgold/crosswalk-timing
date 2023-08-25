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
import { canonicalWaitTimes } from './Simulation/waitTimes'
import {
  CrosswalkId,
  CrosswalkKey,
  crosswalkKey,
  DiagonalLegId,
  Junction,
  Leg,
  LegId,
  legIds,
  MainLegId,
  State,
  states,
  Transition,
} from './state'
import { decodeState } from './stateCoding'
import { compact } from './utils'

const stateString = window.location.hash.replace(/^#/, '')

const { actions, reducer } = createSlice({
  name: 'reducer',
  initialState: decodeState(stateString) ?? states.emptyState,
  reducers: {
    setJunctionTitle(state, action: PayloadAction<string>) {
      state.junctionTitle = action.payload
    },
    setLeg(state, action: PayloadAction<{ legId: LegId; leg: Leg | null }>) {
      if (action.payload.leg?.main) {
        state.junction[action.payload.legId as MainLegId] = action.payload.leg
      } else {
        state.junction[action.payload.legId as DiagonalLegId] =
          action.payload.leg
      }
    },
    setRotation(state, action: PayloadAction<number>) {
      state.junctionRotation = action.payload
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
    setEditMode(state, action: PayloadAction<boolean>) {
      state.inEditMode = action.payload
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
    setJourneyIndexesString(state, action: PayloadAction<string>) {
      state.journeyIndexesString = action.payload
    },
    replaceEntireState(_, action: PayloadAction<State>) {
      return action.payload
    },
    resetState() {
      return { ...states.emptyState, inEditMode: true }
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
  setRotation,
  addTransitionThroughForm,
  updateTransitionInList,
  deleteTransitionFromList,
  setCycleDuraration,
  setCycleOffset,
  setEditMode,
  setEventTimestamps,
  setCrosswalkWalkTime,
  setJourneyIndexesString,
  replaceEntireState,
  resetState,
} = actions

export const makeSelectCrosswalkTransitionsAndIds = () =>
  createSelector<
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
        .filter(([transitionId, transition]) =>
          areCrosswalkIdsEqual(transition.crosswalkId, crosswalkId),
        )
        .sort(([, a], [, b]) => a.timestamp - b.timestamp),
  )

export const selectCrosswalkIdsWithTrafficLights = createSelector(
  (state: State) => state.junction,
  junctionCrosswalkIdsWithTrafficLights,
)

export function junctionCrosswalkIdsWithTrafficLights(
  junction: Junction,
): CrosswalkId[] {
  return legIds.flatMap((legId): CrosswalkId[] => {
    const leg = junction[legId]
    if (!leg) {
      return []
    } else if (leg.main) {
      if (!leg.crosswalk) {
        return []
      } else if (leg.island) {
        return [
          { main: true, legId: legId as MainLegId, part: 'first' },
          { main: true, legId: legId as MainLegId, part: 'second' },
        ]
      } else {
        return [{ main: true, legId: legId as MainLegId }]
      }
    } else {
      if (leg.trafficLight) {
        return [{ main: false, legId: legId as DiagonalLegId }]
      } else {
        return []
      }
    }
  })
}

export const selectCycleDurationSuggestions = createSelector(
  (state: State) => state.transitions,
  (transitions) => cycleDurationSuggestions(transitions),
)

export const selectCanonicalCycleSegments = createSelector<
  [
    Selector<State, CrosswalkId[]>,
    Selector<State, number | undefined>,
    Selector<State, Partial<Record<TimedEventKey, number[]>>>,
  ],
  Map<CrosswalkKey, Segment[]>
>(
  selectCrosswalkIdsWithTrafficLights,
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

export const selectJourneyIndexes = createSelector<
  [Selector<State, string>],
  number[][]
>((state) => state.journeyIndexesString, parseJourneyCrosswalkIndexes)

function parseJourneyCrosswalkIndexes(valueString: string): number[][] {
  const journeyStrings = valueString.trim().split(',')
  const journeyIndexes = compact(
    journeyStrings.map((journeyString) => {
      const numbers = journeyString
        .trim()
        .split(/\s+/)
        .map((indexString) => parseInt(indexString.trim()) - 1)
      if (numbers.some(isNaN) || numbers.length === 0) {
        return null
      } else {
        return numbers
      }
    }),
  )
  return journeyIndexes
}

export function areCrosswalkIdsEqual(a: CrosswalkId, b: CrosswalkId): boolean {
  if (a.main && b.main) {
    return a.legId === b.legId && a.part === b.part
  } else if (!a.main && !b.main) {
    return a.legId === b.legId
  } else {
    return false
  }
}
