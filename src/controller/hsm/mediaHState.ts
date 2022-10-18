import {
  AutorunState,
  HsmEventType,
  HSMStateData,
  // MediaHState,
  Hsm,
  MediaZoneHsmProperties,
  autorunStateFromState,
  MediaHState,
  HsmTimerType,
} from '../../type';
import {
  AutorunDispatch,
  AutorunVoidThunkAction,
  setMediaHStateTimeoutId,
} from '../../model';
import {
  DmState,
  dmGetEventIdsForMediaState,
  BsDmId,
  dmGetEventStateById,
  DmEvent,
  DmTimer,
  DmMediaState,
  DmcEvent,
  DmcMediaState,
  dmGetMediaStateById,
  dmFilterDmState,
  DmcTransition,
} from '@brightsign/bsdatamodel';
import {
  HState,
} from '../../type';
import { EventType, EventIntrinsicAction, ContentItemType } from '@brightsign/bscore';
import {
  getHsmById, getHStateById,
} from '../../selector';
import { isNil, isNumber } from 'lodash';
import {
  // _bsPpStore,
  addHsmEvent,
} from '../hsmController';

export const mediaHStateEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): AutorunVoidThunkAction => {

  return (dispatch: AutorunDispatch, getState: () => any) => {

    // console.log('mediaHStateEventHandler');

    const dmState: DmState = dmFilterDmState(autorunStateFromState(getState()));
    const mediaState: DmMediaState = dmGetMediaStateById(
      dmState,
      { id: (hState as MediaHState).data.mediaStateId }) as DmMediaState;
    if (isNil(mediaState)) {
      debugger;
    }

    const matchedEvent: DmcEvent | null = getMatchedEvent(mediaState, event);

    if (!isNil(matchedEvent)) {
      return executeEventMatchAction(autorunStateFromState(getState()), hState, matchedEvent!, stateData);
    }

    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  };
};

const executeEventMatchAction = (
  state: AutorunState,
  hState: HState,
  event: DmcEvent,
  stateData: HSMStateData
): string => {
  if (isNil(event.transitionList) || event.transitionList.length === 0) {
    switch (event.action) {
      case EventIntrinsicAction.None: {
        // console.log('remain on current state, playContinuous');
        return 'HANDLED';
      }
      case EventIntrinsicAction.ReturnToPriorState: {
        // console.log('return prior state');
        return 'HANDLED';
      }
      // case EventIntrinsicAction.StopPlayback: {
      //   console.log('remain on current state, stopPlayback');
      //   tmpGetVideoElementRef().pause();
      //   return 'HANDLED';
      // }
      // case EventIntrinsicAction.StopPlaybackAndClearScreen: {
      //   console.log('remain on current state, stopPlaybackClearScreen');
      //   // videoPlayer.StopClear()
      //   // imagePlayer.StopDisplay()
      //   tmpGetVideoElementRef().pause();
      //   return 'HANDLED';
      // }
      default: {
        // AUTOTRONTODO
        debugger;
      }
    }
  } else {
    const transition: DmcTransition = event.transitionList[0]; // AUTOTRONTODO - or event.defaultTransition?
    const targetMediaStateId: BsDmId = transition.targetMediaStateId;
    const hsmId: string = hState.hsmId;
    const zoneHsm: Hsm = getHsmById(state, hsmId);

    const mediaZoneHsmData: MediaZoneHsmProperties = zoneHsm.properties as MediaZoneHsmProperties;

    let targetHState: HState = mediaZoneHsmData.mediaStateIdToHState[targetMediaStateId];
    if (!isNil(targetHState)) {

      // check to see if target of transition is a superState
      const targetMediaState: DmMediaState | null = dmGetMediaStateById(
        dmFilterDmState(state),
        {
          id: (targetHState as MediaHState).data.mediaStateId,
        }
      );
      if (!isNil(targetMediaState)) {
        // check for SuperState content item
      } else {
        debugger;
      }

      stateData.nextStateId! = targetHState.id;
      return 'TRANSITION';
    }
  }
  // TEDTODO - should it ever reach here?
  stateData.nextStateId = hState.superStateId;
  return 'SUPER';
};

const eventDataMatches = (matchedEvent: DmcEvent, dispatchedEvent: HsmEventType): boolean => {
  return true;
};

const getMatchedEvent = (mediaState: DmMediaState, dispatchedEvent: HsmEventType): DmcEvent | null => {
  const mediaStateEvents: DmcEvent[] = (mediaState as DmcMediaState).eventList;
  for (const mediaStateEvent of mediaStateEvents) {
    if (mediaStateEvent.type === dispatchedEvent.EventType) {
      if (eventDataMatches(mediaStateEvent, dispatchedEvent)) {
        return mediaStateEvent;
      }
    }
  }
  return null;
};

// const executePauseVideoCommand = (): void => {
//   console.log('pause video');
//   tmpGetVideoElementRef().pause();

//   // const videoElementRef = tmpGetVideoElementRef();
//   // // videoElementRef.setAttribute('src', null);
//   // videoElementRef.removeAttribute('src');
// }

// const executeResumeVideoCommand = (): void => {
//   tmpGetVideoElementRef().play();
// }

export const mediaHStateExitHandler = (
  hStateId: string,
): AutorunVoidThunkAction => {
  return (dispatch: AutorunDispatch, getState: () => AutorunState) => {
    // console.log('mediaHStateExitHandler');
    const hState: HState | null = getHStateById(autorunStateFromState(getState()), hStateId);
    if (!isNil(hState)) {
      const mediaHState: MediaHState = hState as MediaHState;
      if (!isNil(mediaHState.data.mediaStateData)) {
        if (isNumber(mediaHState.data.mediaStateData.timeoutId)) {
          clearTimeout(mediaHState.data.mediaStateData.timeoutId);
          // TEDTODO - is it okay to dispatching an action inside of a whatever
          dispatch(setMediaHStateTimeoutId(hStateId, 0));
        }
        }
    }
  };
};

interface TimeoutEventCallbackParams {
  dispatch: AutorunDispatch;
  hState: HState;
}

export const launchTimer = (
  hState: HState,
): AutorunVoidThunkAction => {

  return (dispatch: AutorunDispatch, getState: () => any) => {

    // at least part of this will move somwhere else
    const bsdm: DmState = autorunStateFromState(getState()).bsdm;

    const eventIds: BsDmId[] = dmGetEventIdsForMediaState(
      bsdm,
      {
        id: (hState as MediaHState).data.mediaStateId
      });
    for (const eventId of eventIds) {
      const event: DmEvent = dmGetEventStateById(bsdm, { id: eventId }) as DmEvent;
      if (event.type === EventType.Timer) {
        const interval: number = (event.data as DmTimer).interval;
        if (interval && interval > 0) {
          const timeoutEventCallbackParams: TimeoutEventCallbackParams = {
            dispatch,
            hState,
          };
          // console.log('launchTimer');
          // console.log(interval);
          const timeoutId: number =
            setTimeout(timeoutHandler, interval * 1000, timeoutEventCallbackParams) as unknown as number;
          dispatch(setMediaHStateTimeoutId(hState.id, timeoutId));
        }
      }
    }
  };
};

const timeoutHandler = (callbackParams: TimeoutEventCallbackParams): void => {

  const event: HsmEventType = {
    EventType: EventType.Timer,
    EventData: HsmTimerType.MediaHState,
  };

  // console.log(event);
  // console.log(callbackParams);

  // const { store } = callbackParams;
  // const hsmId = hState.hsmId;
  // const hsm = getHsmById(store.bsPpStateFromBaApUiState(getState()), hsmId);
  // TEDTODO - circular reference?
  // _bsPpStore.dispatch(addHsmEvent(event));
  callbackParams.dispatch(addHsmEvent(event));
};
