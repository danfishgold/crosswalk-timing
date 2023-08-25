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
import { decodeState } from './stateCoding'
import { compact } from './utils'

export type State = {
  junction: Junction
  junctionTitle: string
  junctionRotation: number
  transitions: Record<string, Transition>
  cursor: Cursor | null
  transitionSuggestion: TransitionSuggestion | null
  cycle: Cycle | null
  eventTimestamps: Partial<Record<TimedEventKey, number[]>>
  walkTimes: Partial<Record<CrosswalkKey, number>>
  inEditMode: boolean
  journeyIndexesString: string
}

export const mainLegIds = ['n', 'e', 's', 'w'] as const
export type MainLegId = (typeof mainLegIds)[number]

export type DiagonalLegId = `${'n' | 's'}${'e' | 'w'}`
export const diagonalLegIds: DiagonalLegId[] = ['ne', 'nw', 'se', 'sw']

export type LegId = MainLegId | DiagonalLegId
export const legIds = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const

export type Junction = Record<MainLegId, MainLeg | null> &
  Record<DiagonalLegId, DiagonalLeg | null>

export type MainLeg = {
  main: true
  crosswalk: boolean
  island: boolean
}

export type DiagonalLeg = {
  main: false
  trafficLight: boolean
}

export type Leg = MainLeg | DiagonalLeg

export type MainCrosswalkId = {
  main: true
  legId: MainLegId
  part?: 'first' | 'second'
}
export type DiagonalCrosswalkId = {
  main: false
  legId: DiagonalLegId
}

export type CrosswalkId = MainCrosswalkId | DiagonalCrosswalkId

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

export type CrosswalkKey =
  | DiagonalLegId
  | MainLegId
  | `${MainLegId}-${'first' | 'second'}`

export function crosswalkKey(crosswalkId: CrosswalkId): CrosswalkKey {
  if (crosswalkId.main && crosswalkId.part) {
    return `${crosswalkId.legId}-${crosswalkId.part}`
  } else {
    return crosswalkId.legId
  }
}

export function isMainLegId(id: LegId): id is MainLegId {
  return (mainLegIds as readonly string[]).includes(id)
}

export const emptyState: State = {
  junction: {
    n: null,
    e: null,
    s: null,
    w: null,
    ne: null,
    nw: null,
    se: null,
    sw: null,
  },
  junctionTitle: '',
  junctionRotation: 0,
  transitions: {},
  cursor: null,
  transitionSuggestion: null,
  cycle: null,
  eventTimestamps: {},
  walkTimes: {},
  inEditMode: true,
  journeyIndexesString: '',
}

export const szoldState: State = {
  junction: {
    n: { main: true, crosswalk: false, island: true },
    e: null,
    s: { main: true, crosswalk: true, island: true },
    w: { main: true, crosswalk: true, island: false },
    ne: null,
    nw: null,
    se: null,
    sw: null,
  },
  junctionTitle: 'ארלוזורוב/הנרייטה סולד',
  junctionRotation: 20,
  transitions: {
    '0.12398773012577846': {
      crosswalkId: { main: true, legId: 's', part: 'first' },
      timestamp: 61,
      toColor: 'red',
    },
    '0.06205668256992425': {
      crosswalkId: { main: true, legId: 's', part: 'first' },
      timestamp: 139,
      toColor: 'green',
    },
    '0.6137002118351933': {
      crosswalkId: { main: true, legId: 's', part: 'first' },
      timestamp: 149,
      toColor: 'red',
    },
    '0.9071513331960934': {
      crosswalkId: { main: true, legId: 's', part: 'second' },
      timestamp: 71,
      toColor: 'green',
    },
    '0.793728302050524': {
      crosswalkId: { main: true, legId: 's', part: 'second' },
      timestamp: 84,
      toColor: 'red',
    },
    '0.5516136306987944': {
      crosswalkId: { main: true, legId: 's', part: 'second' },
      timestamp: 161,
      toColor: 'green',
    },
    '0.8799757999376338': {
      crosswalkId: { main: true, legId: 's', part: 'second' },
      timestamp: 174,
      toColor: 'red',
    },
    '0.8095581678087502': {
      crosswalkId: { main: true, legId: 'w' },
      timestamp: 38,
      toColor: 'red',
    },
    '0.8425316385763103': {
      crosswalkId: { main: true, legId: 'w' },
      timestamp: 94,
      toColor: 'green',
    },
    '0.7279889478335789': {
      crosswalkId: { main: true, legId: 'w' },
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
  journeyIndexesString: '1 2 3, 3 2 1',
}

const weizmannState: State = {
  junction: {
    n: { main: true, crosswalk: true, island: true },
    e: { main: true, crosswalk: true, island: true },
    s: { main: true, crosswalk: true, island: true },
    w: { main: true, crosswalk: true, island: true },
    ne: null,
    nw: null,
    se: null,
    sw: null,
  },
  junctionTitle: 'ארלוזורוב/ויצמן',
  junctionRotation: 0,
  transitions: {
    '0.5223888119273669': {
      timestamp: 35,
      crosswalkId: { main: true, legId: 'n', part: 'first' },
      toColor: 'green',
    },
    '0.7534059214753597': {
      timestamp: 37,
      crosswalkId: { main: true, legId: 'n', part: 'second' },
      toColor: 'green',
    },
    '0.42789173422594307': {
      timestamp: 51,
      crosswalkId: { main: true, legId: 'n', part: 'first' },
      toColor: 'red',
    },
    '0.4910721850368728': {
      timestamp: 60,
      crosswalkId: { main: true, legId: 'n', part: 'second' },
      toColor: 'red',
    },
    '0.019021264114906233': {
      timestamp: 125,
      crosswalkId: { main: true, legId: 'n', part: 'first' },
      toColor: 'green',
    },
    '0.5901882857959485': {
      timestamp: 127,
      crosswalkId: { main: true, legId: 'n', part: 'second' },
      toColor: 'green',
    },
    '0.0713502050993875': {
      timestamp: 147,
      crosswalkId: { main: true, legId: 'e', part: 'second' },
      toColor: 'red',
    },
    '0.5288307101029167': {
      timestamp: 150,
      crosswalkId: { main: true, legId: 'e', part: 'first' },
      toColor: 'green',
    },
    '0.3696954515072949': {
      timestamp: 193,
      crosswalkId: { main: true, legId: 'e', part: 'second' },
      toColor: 'green',
    },
    '0.48580480924008884': {
      timestamp: 202,
      crosswalkId: { main: true, legId: 'e', part: 'first' },
      toColor: 'red',
    },
    '0.20179185833384095': {
      timestamp: 236,
      crosswalkId: { main: true, legId: 'e', part: 'second' },
      toColor: 'red',
    },
    '0.9901914862470048': {
      timestamp: 243,
      crosswalkId: { main: true, legId: 's', part: 'first' },
      toColor: 'green',
    },
    '0.46491366153151437': {
      timestamp: 244,
      crosswalkId: { main: true, legId: 's', part: 'second' },
      toColor: 'green',
    },
    '0.04853160026547032': {
      timestamp: 271,
      crosswalkId: { main: true, legId: 's', part: 'first' },
      toColor: 'red',
    },
    '0.1410476561303039': {
      timestamp: 273,
      crosswalkId: { main: true, legId: 's', part: 'second' },
      toColor: 'red',
    },
    '0.5753717319694281': {
      timestamp: 281,
      crosswalkId: { main: true, legId: 'w', part: 'first' },
      toColor: 'green',
    },
    '0.7199638828397977': {
      timestamp: 296,
      crosswalkId: { main: true, legId: 'w', part: 'second' },
      toColor: 'red',
    },
    '0.2979234493538847': {
      timestamp: 396,
      crosswalkId: { main: true, legId: 'n', part: 'second' },
      toColor: 'green',
    },
    '0.7290582020914632': {
      timestamp: 394,
      crosswalkId: { main: true, legId: 'n', part: 'first' },
      toColor: 'green',
    },
    '0.02871591746746094': {
      crosswalkId: { main: true, legId: 'w', part: 'first' },
      timestamp: 321,
      toColor: 'red',
    },
    '0.8512535069566213': {
      crosswalkId: { main: true, legId: 'w', part: 'second' },
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
  journeyIndexesString: '',
}

const ibnGavirolState: State = {
  junction: {
    n: { main: true, crosswalk: true, island: false },
    e: { main: true, crosswalk: true, island: false },
    s: { main: true, crosswalk: true, island: true },
    w: { main: true, crosswalk: true, island: true },
    ne: null,
    nw: null,
    se: null,
    sw: null,
  },
  junctionTitle: 'אבן גבירול/מלכי ישראל/צייטלין',
  junctionRotation: 0,
  transitions: {
    '0.6560413026551709': {
      timestamp: 16,
      crosswalkId: { main: true, legId: 's', part: 'second' },
      toColor: 'red',
    },
    '0.32769534005971723': {
      timestamp: 50,
      crosswalkId: { main: true, legId: 's', part: 'first' },
      toColor: 'green',
    },
    '0.3655223187793696': {
      timestamp: 63,
      crosswalkId: { main: true, legId: 's', part: 'first' },
      toColor: 'red',
    },
    '0.7882365378100387': {
      timestamp: 74,
      crosswalkId: { main: true, legId: 's', part: 'second' },
      toColor: 'green',
    },
    '0.007307066977294663': {
      timestamp: 130,
      crosswalkId: { main: true, legId: 'w', part: 'first' },
      toColor: 'red',
    },
    '0.4411148316770346': {
      timestamp: 141,
      crosswalkId: { main: true, legId: 'w', part: 'second' },
      toColor: 'green',
    },
    '0.4361864580513888': {
      timestamp: 158,
      crosswalkId: { main: true, legId: 'w', part: 'second' },
      toColor: 'red',
    },
    '0.6431062651411903': {
      timestamp: 163,
      crosswalkId: { main: true, legId: 'w', part: 'first' },
      toColor: 'green',
    },
    '0.6382024372367233': {
      timestamp: 219,
      crosswalkId: { main: true, legId: 'w', part: 'first' },
      toColor: 'red',
    },
    '0.6186025020741253': {
      timestamp: 256,
      crosswalkId: { main: true, legId: 'n' },
      toColor: 'green',
    },
    '0.34244479898243874': {
      timestamp: 286,
      crosswalkId: { main: true, legId: 'e' },
      toColor: 'red',
    },
    '0.48836639545964533': {
      timestamp: 345,
      crosswalkId: { main: true, legId: 'e' },
      toColor: 'green',
    },
    '0.9604670394325503': {
      timestamp: 346,
      crosswalkId: { main: true, legId: 'n' },
      toColor: 'green',
    },
    '0.12581529052436036': {
      timestamp: 365,
      crosswalkId: { main: true, legId: 'n' },
      toColor: 'red',
    },
    '0.21683608413261712': {
      timestamp: 376,
      crosswalkId: { main: true, legId: 'e' },
      toColor: 'red',
    },
  },
  cursor: null,
  transitionSuggestion: null,
  cycle: { duration: 90, offset: -21 },
  eventTimestamps: {
    'n-green': [76],
    'n-red': [5],
    'e-green': [75],
    'e-red': [16],
    's-first-green': [50],
    's-first-red': [63],
    's-second-green': [74],
    's-second-red': [16],
    'w-first-green': [73],
    'w-first-red': [40],
    'w-second-green': [51],
    'w-second-red': [68],
  },
  walkTimes: {
    n: 8,
    e: 8,
    's-first': 8,
    's-second': 8,
    'w-first': 8,
    'w-second': 8,
  },
  inEditMode: false,
  journeyIndexesString: '5 6 0',
}

const weizmannSheinkin: State = {
  junction: {
    n: { main: true, crosswalk: true, island: false },
    e: { main: true, crosswalk: true, island: false },
    s: { main: true, crosswalk: true, island: true },
    w: null,
    ne: { main: false, trafficLight: true },
    nw: null,
    se: null,
    sw: null,
  },
  junctionTitle: 'ויצמן / שינקין (גבעתיים)',
  junctionRotation: 0,
  transitions: {
    '0.8095581678087502': {
      crosswalkId: { main: true, legId: 'w' },
      timestamp: 38,
      toColor: 'red',
    },
    '0.8425316385763103': {
      crosswalkId: { main: true, legId: 'w' },
      timestamp: 94,
      toColor: 'green',
    },
    '0.7279889478335789': {
      crosswalkId: { main: true, legId: 'w' },
      timestamp: 128,
      toColor: 'red',
    },
    '0.2768855593110927': {
      timestamp: 16,
      crosswalkId: { main: true, legId: 's', part: 'first' },
      toColor: 'green',
    },
    '0.27661188261833103': {
      timestamp: 80,
      crosswalkId: { main: true, legId: 's', part: 'first' },
      toColor: 'red',
    },
    '0.5165923154880157': {
      timestamp: 86,
      crosswalkId: { main: true, legId: 's', part: 'second' },
      toColor: 'green',
    },
    '0.9261676052177849': {
      timestamp: 95,
      crosswalkId: { main: true, legId: 's', part: 'second' },
      toColor: 'red',
    },
    '0.3094993588160805': {
      timestamp: 121,
      crosswalkId: { main: true, legId: 's', part: 'first' },
      toColor: 'green',
    },
    '0.3927936648356134': {
      timestamp: 185,
      crosswalkId: { main: true, legId: 's', part: 'first' },
      toColor: 'red',
    },
    '0.7552916409881515': {
      timestamp: 191,
      crosswalkId: { main: true, legId: 's', part: 'second' },
      toColor: 'green',
    },
    '0.5249725264099127': {
      timestamp: 200,
      crosswalkId: { main: true, legId: 's', part: 'second' },
      toColor: 'red',
    },
    '0.7639630927572675': {
      timestamp: 226,
      crosswalkId: { main: true, legId: 's', part: 'first' },
      toColor: 'green',
    },
    '0.8626904924929485': {
      timestamp: 226,
      crosswalkId: { main: true, legId: 'e' },
      toColor: 'red',
    },
    '0.5359834360690635': {
      timestamp: 293,
      crosswalkId: { main: true, legId: 'e' },
      toColor: 'green',
    },
    '0.5590570206896905': {
      timestamp: 296,
      crosswalkId: { main: false, legId: 'ne' },
      toColor: 'green',
    },
    '0.9671960997418088': {
      timestamp: 332,
      crosswalkId: { main: false, legId: 'ne' },
      toColor: 'red',
    },
    '0.015605758467263753': {
      timestamp: 332,
      crosswalkId: { main: true, legId: 'e' },
      toColor: 'red',
    },
    '0.49005655928813274': {
      timestamp: 401,
      crosswalkId: { main: false, legId: 'ne' },
      toColor: 'green',
    },
    '0.08105954443554164': {
      timestamp: 398,
      crosswalkId: { main: true, legId: 'e' },
      toColor: 'green',
    },
    '0.2874306503102727': {
      timestamp: 437,
      crosswalkId: { main: false, legId: 'ne' },
      toColor: 'red',
    },
    '0.8639688507577369': {
      timestamp: 479,
      crosswalkId: { main: true, legId: 'n' },
      toColor: 'green',
    },
    '0.4901868706330408': {
      timestamp: 495,
      crosswalkId: { main: true, legId: 'n' },
      toColor: 'red',
    },
  },
  cursor: null,
  transitionSuggestion: null,
  cycle: { duration: 105, offset: 83 },
  eventTimestamps: {
    'w-green': [4],
    'w-red': [38],
    's-first-green': [16],
    's-first-red': [80],
    's-second-green': [86],
    's-second-red': [95],
    'sw-green': [],
    'sw-red': [],
    'e-first-green': [],
    'e-first-red': [],
    'e-second-green': [],
    'e-second-red': [],
    'n-green': [59],
    'n-red': [75],
    'e-green': [83],
    'e-red': [17],
    'ne-green': [86],
    'ne-red': [17],
  },
  walkTimes: { w: 7, 's-first': 5, 's-second': 5, n: 7, ne: 5, e: 7 },
  inEditMode: false,
  journeyIndexesString: '2 3 4 5',
}

const stateString = window.location.hash.replace(/^#/, '')

const { actions, reducer } = createSlice({
  name: 'reducer',
  initialState: decodeState(stateString) ?? emptyState,
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

export const selectCrosswalkHighlightColors = createSelector<
  [Selector<State, CrosswalkId[]>, Selector<State, CrosswalkId | null>],
  Record<CrosswalkKey, Highlight | null>
>(
  selectCrosswalkIdsWithTrafficLights,
  (state) => state.cursor?.crosswalkId ?? null,
  crosswalkHighlightColors,
)

function crosswalkHighlightColors(
  crosswalkIds: CrosswalkId[],
  cursorCrosswalkId: CrosswalkId | null,
): Record<CrosswalkKey, Highlight | null> {
  const entries = crosswalkIds.map((id) => {
    const key = crosswalkKey(id)
    if (cursorCrosswalkId && crosswalkKey(cursorCrosswalkId) === key) {
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
