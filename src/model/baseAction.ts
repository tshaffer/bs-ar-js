/* eslint-disable @typescript-eslint/ban-types */
/** @module Model:base */

import {
  Action,
  Dispatch,
  ActionCreator,
} from 'redux';
import { 
  AutorunPlayerState,
 } from '../type';

// -----------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export interface AutorunModelBaseAction extends Action {
  type: string;   // override Any - must be a string
  payload?: {} | null;
  error?: boolean;
  meta?: {};
}

/** @internal */
/** @private */
export interface AutorunModelAction<T> extends AutorunModelBaseAction {
  payload: T;     // override payload with specific parameter type
}

/** @internal */
/** @private */
export type AutorunModelActionCreator<T> = ActionCreator<AutorunModelAction<T>>;
export type AutorunModelThunkAction<T> = (
  dispatch: AutorunDispatch,
  getState: () => AutorunPlayerState,
  extraArgument: undefined,
) => T;

export interface AutorunBaseAction extends Action {
  type: string;
  payload: {} | null;
  error?: boolean;
  meta?: {};
}

// export interface AutorunAction<T> extends AutorunBaseAction {
//   payload: T;
// }

// export type AutorunDispatch = Dispatch<AutorunState>;
export type AutorunDispatch = Dispatch<any>;
export type AutorunVoidThunkAction = any;
// (dispatch: AutorunDispatch, getState: () => BaApUiState, extraArgument: undefined) => void;
export type AutorunStringThunkAction = any;
// (dispatch: AutorunDispatch, getState: () => BaApUiState, extraArgument: undefined) => string;
export type AutorunVoidPromiseThunkAction = any;
// (dispatch: AutorunDispatch, getState: () => BaApUiState, extraArgument: undefined) => Promise<void>;
export type AutorunThunkAction<T> = any;
// (dispatch: AutorunDispatch, getState: () => BaApUiState, extraArgument: undefined) => AutorunAction<T>;
export type AutorunAnyPromiseThunkAction = any;
// (dispatch: AutorunDispatch, getState: () => BaApUiState, extraArgument: undefined) => Promise<any>;

// export type AutorunActionCreator<T> = ActionCreator<AutorunAction<T>>;

export interface AutorunModelBatchAction extends Action {
  type: string;
  payload: AutorunBaseAction[];
}

// -----------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------

/** @internal */
/** @private */
interface AppModelBaseAction extends Action {
  type: string;   // override Any - must be a string
  payload: unknown;
  error?: boolean;
  meta?: {};
}

/** @internal */
/** @private */
export interface AppModelAction<T> extends AppModelBaseAction {
  type: string;
  payload: T;
  error?: boolean;
  meta?: {};
}
