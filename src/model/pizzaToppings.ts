import { AppModelAction } from './baseAction';
import { PizzaTopping } from '../type';

// ------------------------------------
// Constants
// ------------------------------------
export const ADD_PIZZA_TOPPINGS = 'ADD_PIZZA_TOPPINGS';

// ------------------------------------
// Actions
// ------------------------------------
type AddPizzaToppingsPayload = PizzaTopping[];
type AddPizzaToppingsAction = AppModelAction<AddPizzaToppingsPayload>;

export const addPizzaToppings = (
  pizzaToppings: PizzaTopping[],
): AddPizzaToppingsAction => {
  return {
    type: ADD_PIZZA_TOPPINGS,
    payload: pizzaToppings,
  };
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState: PizzaTopping[] = [];

export const pizzaToppingsReducer = (
  state: PizzaTopping[] = initialState,
  action: AddPizzaToppingsAction,
): PizzaTopping[] => {
  switch (action.type) {
    case ADD_PIZZA_TOPPINGS: {
      return action.payload;
    }
    default:
      return state;
  }
};

