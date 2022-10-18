/* eslint-disable @typescript-eslint/ban-types */
/** @module Model:base */

import {
  Action,
  Dispatch,
  ActionCreator,
  AnyAction,
} from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  AutorunPlayerState, AutorunState,
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
  payload: T | any;     // override payload with specific parameter type
}

/** @internal */
/** @private */
export type AutorunModelActionCreator<T> = ActionCreator<AutorunModelAction<T>>;
export type AutorunModelThunkAction<T> = (
  dispatch: AutorunDispatch,
  getState: () => AutorunPlayerState,
  extraArgument: undefined,
) => T;


export type AutorunDispatch = ThunkDispatch<AutorunState, undefined, AutorunAction<AnyAction>>;
export type AutorunVoidThunkAction = (dispatch: AutorunDispatch, getState: () => AutorunState, extraArgument: undefined) => void;
export type AutorunStringThunkAction = (dispatch: AutorunDispatch, getState: () => AutorunState, extraArgument: undefined) => string;
export type AutorunVoidPromiseThunkAction = (dispatch: AutorunDispatch, getState: () => AutorunState, extraArgument: undefined) => Promise<void>;
export type AutorunAnyPromiseThunkAction = (dispatch: AutorunDispatch, getState: () => AutorunState, extraArgument: undefined) => Promise<any>;

export interface AutorunBaseActionMetadata {
  dispatchList?: AutorunBaseAction[];
  reason?: string;
}

export interface AutorunBaseAction extends Action {
  type: string;
  payload: {} | null;
  error?: boolean;
  meta?: {};
}

export interface AutorunAction<T> extends AutorunBaseAction {
  payload: T | any;
}

export type AutorunActionCreator<T> = ActionCreator<AutorunAction<T>>;
export type AutorunThunkAction<T> = (dispatch: AutorunDispatch, getState: () => AutorunState, extraArgument: undefined) => AutorunAction<T>;

export type AutorunSpecificThunkAction<T> = (dispatch: AutorunDispatch, getState: () => AutorunState, extraArgument: undefined) => T;
export interface AutorunBatchAction extends Action {
  type: string;
  payload: AutorunBaseAction[];
}

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
