/** @internal */
/** @private */
export interface AppModelState {
  pizzaName: PizzaName;
  pizzaToppings: PizzaTopping[];
}

/** @internal */
/** @private */
export interface PizzaName {
  type: string;
}

/** @internal */
/** @private */
export interface PizzaTopping {
  label: string;
  meat: boolean;
}

