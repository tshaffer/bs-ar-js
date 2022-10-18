
import {
  createHsm,
  initializeHsm,
} from './hsm';
import { createHState, createHStateSpecification } from './hState';
import {
  getHsmByName,
  getHStateByName,
} from '../../selector/hsm';
import {
  HState,
  HsmType,
  HStateType,
  HsmEventType,
  HSMStateData,
  autorunStateFromState,
} from '../../type';
import {
  AutorunAnyPromiseThunkAction,
} from '../../model';
import {
  isNil,
  //  isString
} from 'lodash';
import { setHsmTop } from '../../model';

import {
  AutorunState,
  // PpSchedule,
} from '../../type';
import {
  AutorunDispatch,
  AutorunVoidThunkAction,
  AutorunVoidPromiseThunkAction,
} from '../../model';

import {
  // getAutoschedule,
  // getSyncSpecFileMap,
  // getSrcDirectory,
  getZoneHsmList,
  // getDataFeedById,
  // getSyncSpecReferencedFile,
} from '../../selector';
import {
  BsDmId,
  // DmSignState,
  // dmOpenSign,
  DmState,
  dmGetZoneById,
  DmZone,
  dmGetZonesForSign,
} from '@brightsign/bsdatamodel';
import { hsmConstructorFunction } from '../hsm/eventHandler';
import { createMediaZoneHsm } from './mediaZoneHsm';
import { getIsHsmInitialized } from '../../selector';
import { addHsmEvent } from '../hsmController';
import { openSign } from '../appController';

export const createPlayerHsm = (): any => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    const playerHsmId: string = dispatch(createHsm('player', HsmType.Player, {}));

    const stTopId = dispatch(createHState(
      createHStateSpecification(
        HStateType.Top,
        playerHsmId,
        '',
        'top',
      ),
    ));

    dispatch(setHsmTop(playerHsmId, stTopId));

    const stPlayerId = dispatch(createHState(
      createHStateSpecification(
        HStateType.Player,
        playerHsmId,
        stTopId,
        'player',
      ),
    ));

    dispatch(createHState(
      createHStateSpecification(
        HStateType.Playing,
        playerHsmId,
        stPlayerId,
        'playing',
      ),
    ));

    dispatch(createHState(
      createHStateSpecification(
        HStateType.Waiting,
        playerHsmId,
        stPlayerId,
        'waiting',
      ),
    ));
  });
};

export const initializePlayerHsm = (): any => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    const playerHsm = getHsmByName(autorunStateFromState(getState()), 'player');
    if (!isNil(playerHsm)) {
      dispatch(initializeHsm(playerHsm!.id));
    }
  });
};

export const playerHsmGetInitialState = (): AutorunAnyPromiseThunkAction => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    return dispatch(launchSchedulePlayback(''))
      .then(() => {
        const hState = getHStateByName(autorunStateFromState(getState()), 'playing');
        return Promise.resolve(hState);
      });
  });
};

export const STPlayerEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  });
};

export const STPlayingEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {

  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    stateData.nextStateId = null;
    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      const action: any = launchPresentationPlayback();
      dispatch(action);
      return 'HANDLED';
    }
    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  });
};

export const STWaitingEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {

  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    stateData.nextStateId = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      // console.log(hState.id + ': entry signal');
      return 'HANDLED';
    } else if (event.EventType && event.EventType === 'TRANSITION_TO_PLAYING') {
      // console.log(hState.id + ': TRANSITION_TO_PLAYING event received');
      // const hsmId: string = hState.hsmId;
      // const hsm: PpHsm = getHsmById(bsPpStateFromBaApUiState(getState()), hsmId);
      const stPlayingState: HState | null = getHStateByName(autorunStateFromState(getState()), 'Playing');
      if (!isNil(stPlayingState)) {
        stateData.nextStateId = stPlayingState!.id;
        return 'TRANSITION';
      }
      debugger;
    }

    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  });
};

export const launchSchedulePlayback = (presentationName: string): AutorunVoidPromiseThunkAction => {
  return (dispatch: AutorunDispatch, getState: () => AutorunState) => {
    const action = openSign(presentationName);
    const promise = dispatch(action as any);
    return promise;
  };
};

export const launchPresentationPlayback = (): AutorunVoidThunkAction => {

  return (dispatch: AutorunDispatch, getState: () => AutorunState) => {

    const bsdm: DmState = autorunStateFromState(getState()).bsdm;

    const zoneIds: BsDmId[] = dmGetZonesForSign(bsdm);
    zoneIds.forEach((zoneId: BsDmId) => {
      const bsdmZone: DmZone = dmGetZoneById(bsdm, { id: zoneId }) as DmZone;
      console.log(bsdmZone);
      dispatch(createMediaZoneHsm(zoneId, bsdmZone.type.toString(), bsdmZone));
    });

    const promises: Array<Promise<void>> = [];

    const zoneHsmList = getZoneHsmList(autorunStateFromState(getState()));
    for (const zoneHsm of zoneHsmList) {
      dispatch(hsmConstructorFunction(zoneHsm.id));
      const action: AutorunVoidPromiseThunkAction = initializeHsm(zoneHsm.id);
      promises.push(dispatch(action));
    }

    Promise.all(promises).then(() => {
      const hsmInitializationComplete = getIsHsmInitialized(autorunStateFromState(getState()));
      if (hsmInitializationComplete) {
        const event: HsmEventType = {
          EventType: 'NOP',
        };
        dispatch(addHsmEvent(event));
      }
    });

  };
};
