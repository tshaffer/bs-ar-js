import { DmMediaState } from '@brightsign/bsdatamodel';
import {
  HState,
  HStateType,
  HsmEventType,
  HSMStateData,
} from '../../type';
import {
  AutorunStringThunkAction,
  AutorunDispatch,
  AutorunVoidThunkAction,
} from '../../model';
import { launchTimer, mediaHStateExitHandler, mediaHStateEventHandler } from './mediaHState';
import { createHState, createHStateSpecification } from './hState';

export const createSuperState = (
  hsmId: string,
  mediaState: DmMediaState,
  superStateId: string,
): AutorunStringThunkAction => {
  return ((dispatch: AutorunDispatch) => {
    const stateId: string = dispatch(createHState(
      createHStateSpecification(
        HStateType.SuperState,
        hsmId,
        superStateId,
        '',
      ),
      {
        mediaStateId: mediaState.id,
      },
    ));
    return stateId;
  });
};


export const STSuperStateEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): AutorunVoidThunkAction => {
  return (dispatch: AutorunDispatch) => {
    if (event.EventType === 'ENTRY_SIGNAL') {
      console.log('STSuperStateEventHandler: entry signal');
      dispatch(launchTimer(hState));
      return 'HANDLED';
    } else if (event.EventType === 'EXIT_SIGNAL') {
      dispatch(mediaHStateExitHandler(hState.id));
      stateData.nextStateId = hState.superStateId;
      return 'SUPER';
    } else {
      return dispatch(mediaHStateEventHandler(hState, event, stateData));
    }
  };
};
