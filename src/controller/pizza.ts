import { addPizzaToppings, setPizzaName } from '../model';
import { PizzaTopping } from '../type';
import { loadPresentationData } from './appController';

export const makePizza = () => {
  return ((dispatch: any, getState: any): any => {

    console.log('invoke loadPresentationData');
    const p: Promise<any> = loadPresentationData();
    p.then( (runtimeEnvironment: string) => {
      console.log('loadPresentationData promise resolved');
      console.log(runtimeEnvironment);
    }).catch( (e: any) => {
      console.log('loadPresentation rejected: ');
      console.log(e);
    });
    
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
