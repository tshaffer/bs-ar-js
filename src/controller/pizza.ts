import { addPizzaToppings, setPizzaName } from '../model';
import { PizzaTopping } from '../type';

export const makePizza = () => {
  return ((dispatch: any, getState: any): any => {

    dispatch(setPizzaName({ type: 'Pizza Bianco' }));

    const pizzaToppings: PizzaTopping[] = [
      { label: 'Pepperoni', meat: true },
      { label: 'Garlic', meat: false },
    ];

    dispatch(addPizzaToppings(pizzaToppings));

    console.log('pizzaState');
    console.log(getState());
  });
};

