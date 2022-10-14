/** @module Model:base */

import {
  Reducer,
  combineReducers
} from 'redux';
import { AutorunPlayerState } from '../type';
import {
  AutorunModelBaseAction,
} from './baseAction';
import { hsmReducer } from './hsm';
import { presentationDataReducer } from './presentation';
import { playbackReducer } from './playback';

// -----------------------------------------------------------------------
// Defaults
// -----------------------------------------------------------------------

// none

// -----------------------------------------------------------------------
// Reducers
// -----------------------------------------------------------------------

export type AutorunReducer = Reducer<AutorunPlayerState>;
export const enableBatching = (
  reduce: (state: AutorunPlayerState, action: AutorunModelBaseAction) => AutorunPlayerState,
): AutorunReducer => {
  return function batchingReducer(
    state: AutorunPlayerState,
    action: AutorunModelBaseAction,
  ): AutorunPlayerState {
    switch (action.type) {
      default:
        return reduce(state, action);
    }
  };
};

export const autorunReducer = enableBatching(combineReducers<AutorunPlayerState>({
  hsmState: hsmReducer,
  playback: playbackReducer,
  presentationData: presentationDataReducer,
}));
