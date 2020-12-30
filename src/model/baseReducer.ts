import {
  combineReducers
} from 'redux';
import { AppModelState } from '../type';
import { pizzaNameReducer } from './pizzaName';
import { pizzaToppingsReducer } from './pizzaToppings';

// -----------------------------------------------------------------------
// Reducers
// -----------------------------------------------------------------------

export const appReducer = combineReducers<AppModelState>({
  pizzaName: pizzaNameReducer,
  pizzaToppings: pizzaToppingsReducer,
});
