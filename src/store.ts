import { configureStore } from '@reduxjs/toolkit'
import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from 'react-redux'
import reducer from './reducer'

export const store = configureStore({ reducer })

export type State = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
export const useDispatch = () => useReduxDispatch<AppDispatch>()

export const useSelector = <T>(selector: (state: State) => T): T =>
  useReduxSelector<State, T>(selector)
