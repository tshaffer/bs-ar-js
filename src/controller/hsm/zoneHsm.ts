import { createHsm } from './hsm';
import { createHState, createHStateSpecification } from './hState';
import {
  HState,
  HStateType,
  HsmProperties,
  HsmType,
  AutorunState,
  autorunStateFromState,
} from '../../type';
import {
  AutorunStringThunkAction, AutorunDispatch,
} from '../../model';

import { isNil } from 'lodash';
import { setHsmTop } from '../../model';
import { getHStateByName } from '../../selector/hsm';

export const createZoneHsm = (
  hsmName: string,
  hsmType: HsmType,
  hsmData: HsmProperties
): AutorunStringThunkAction => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    const hsmId: string = dispatch(createHsm(hsmName, hsmType, hsmData));

    dispatch(createHState(
      createHStateSpecification(
        HStateType.Top,
        hsmId,
        '',
        'top',
      ),
    ));
    const stTop: HState | null = getHStateByName(autorunStateFromState(getState()), 'top');
    const stTopId: string = isNil(stTop) ? '' : stTop!.id;

    dispatch(setHsmTop(hsmId, stTopId));

    return hsmId;
  });
};
