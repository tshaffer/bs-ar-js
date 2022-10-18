import {
  HsmEventType,
  Hsm,
  HState,
  AutorunState,
  autorunStateFromState,
} from '../type';
import {
  AutorunDispatch, AutorunVoidThunkAction, queueHsmEvent,
} from '../model';

import {
  createPlayerHsm,
  initializePlayerHsm,
  hsmDispatch,
} from './hsm';

import {
  HsmMap,
} from '../type';
import {
  dequeueHsmEvent,
} from '../model';

import {
  getHsmMap,
  getActiveHStateIdByHsmId,
  getHsmByName,
  getIsHsmInitialized,
  getEvents,
} from '../selector';
import { isNil } from 'lodash';

/** @internal */
/** @private */
export function launchHsm() {
  return ((dispatch: AutorunDispatch) => {
    dispatch(createPlayerHsm());
    dispatch(initializePlayerHsm());
  });
}

export const addHsmEvent = (event: HsmEventType): AutorunVoidThunkAction => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    if (event.EventType !== 'NOP') {
      dispatch(queueHsmEvent(event));
    }
    if (getIsHsmInitialized(autorunStateFromState(getState()))) {
      let events: HsmEventType[] = getEvents(autorunStateFromState(getState()));

      while (events.length > 0) {
        dispatch(dispatchHsmEvent(events[0]));
        dispatch(dequeueHsmEvent());
        events = getEvents(autorunStateFromState(getState()));
      }
    }
  });
};

function dispatchHsmEvent(
  event: HsmEventType
): AutorunVoidThunkAction {

  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {

    const state: AutorunState = autorunStateFromState(getState());

    const playerHsm: Hsm | null = getHsmByName(state, 'player');
    if (!isNil(playerHsm)) {
      dispatch(hsmDispatch(event, playerHsm!.id, playerHsm!.activeStateId) as any);
      const hsmMap: HsmMap = getHsmMap(state);
      for (const hsmId in hsmMap) {
        if (hsmId !== playerHsm!.id) {
          const activeState: HState | null = getActiveHStateIdByHsmId(state, hsmId);
          if (!isNil(activeState)) {
            dispatch(hsmDispatch(event, hsmId, activeState!.id) as any);
          } else {
            debugger;
          }
        }
      }
    }
  });
}
