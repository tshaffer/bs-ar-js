/* eslint-disable @typescript-eslint/ban-types */
/** @module Model:base */

import {
  Action,
} from 'redux';

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
