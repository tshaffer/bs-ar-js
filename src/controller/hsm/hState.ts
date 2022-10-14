import {
  HStateSpecification,
  MediaHStateData
} from '../../type';
import { addHState } from '../../model';
import { newAutorunId } from '../../utility';
import {
  AutorunDispatch,
  AutorunStringThunkAction,
} from '../../model';

export const createHState = (
  hStateSpecification: HStateSpecification,
  data: MediaHStateData | null = null,
): AutorunStringThunkAction => {
  return ((dispatch: AutorunDispatch) => {
    const id: string = newAutorunId();
    dispatch(addHState(id, hStateSpecification, data));
    return id;
  });
};

export const createHStateSpecification = (
  type: string,
  hsmId: string,
  superStateId: string,
  name: string,
): HStateSpecification => {
  const hStateSpecification = {
    type,
    hsmId,
    superStateId,
    name
  };
  return hStateSpecification;
};
