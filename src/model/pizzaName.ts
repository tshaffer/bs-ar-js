// ------------------------------------
// Constants
// ------------------------------------

import {
  PizzaName
} from '../type';
import { AppModelAction } from './baseAction';

// ------------------------------------
export const SET_PIZZA_NAME = 'SET_PIZZA_NAME';

// ------------------------------------
// Actions
// ------------------------------------
type SetPizzaNamePayload = PizzaName;
type SetPizzaNameAction = AppModelAction<SetPizzaNamePayload>;

export const setPizzaName = (
  pizzaName: PizzaName,
): SetPizzaNameAction => {
  return {
    type: SET_PIZZA_NAME,
    payload: pizzaName,
  };
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState: PizzaName = {
  type: ''
};

export const pizzaNameReducer = (
  state: PizzaName = initialState,
  action: SetPizzaNameAction
): PizzaName => {
  switch (action.type) {
    case SET_PIZZA_NAME: {
      return {
        ...state,
        type: action.payload.type,
      };
    }
    default:
      return state;
  }
};
