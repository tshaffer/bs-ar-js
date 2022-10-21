/* eslint-disable no-case-declarations */
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
  HsmMap,
  HsmType,
  HsmKeydownType,
  HsmBpType,
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
  DmSuperStateContentItem,
  DmBpEventData,
  DmEventData,
  DmKeyboardEventData,
} from '@brightsign/bsdatamodel';
import {
  HState,
} from '../../type';
import { EventType, EventIntrinsicAction, ContentItemType } from '@brightsign/bscore';
import {
  getActiveHStateIdByHsmId,
  getHsmById, getHsmMap, getHStateById,
} from '../../selector';
import { isNil, isNumber, isString } from 'lodash';
import {
  addHsmEvent,
} from '../hsmController';

export const mediaHStateEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): AutorunVoidThunkAction => {

  return (dispatch: AutorunDispatch, getState: () => any) => {

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
        return 'HANDLED';
      }
      case EventIntrinsicAction.ReturnToPriorState: {
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
        if (targetMediaState!.contentItem.type === ContentItemType.SuperState) {
          const superStateContentItem = targetMediaState!.contentItem as DmSuperStateContentItem;
          const initialMediaStateId = superStateContentItem.initialMediaStateId;
          targetHState = mediaZoneHsmData.mediaStateIdToHState[initialMediaStateId];
        }
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

const getMatchedEvent = (mediaState: DmMediaState, dispatchedEvent: HsmEventType): DmcEvent | null => {

  let mediaStateEventData: DmEventData | null = null;

  const mediaStateEvents: DmcEvent[] = (mediaState as DmcMediaState).eventList;
  for (const mediaStateEvent of mediaStateEvents) {
    if (mediaStateEvent.type === dispatchedEvent.EventType) {
      // TODO - general purpose way to do this?
      switch (mediaStateEvent.type) {
        case EventType.Keyboard:
          mediaStateEventData = mediaStateEvent.data;
          if (isNil(mediaStateEventData)) {
            return null;
          }
          if (isNil(dispatchedEvent.data) || !isString(dispatchedEvent.data)) {
            return null;
          }
          if ((mediaStateEventData as DmKeyboardEventData).data === dispatchedEvent.data) {
            return mediaStateEvent;
          }
          break;
        case EventType.Bp:
          mediaStateEventData = mediaStateEvent.data;
          if (isNil(mediaStateEventData)) {
            return null;
          }
          // if (isNil(dispatchedEvent.data) || !isString(dispatchedEvent.data)) {
          //   return null;
          // }
          console.log('BP Event received');
          console.log('dispatchedEvent.data');
          console.log(dispatchedEvent.data);
          console.log('bpEventData');
          console.log((mediaStateEventData as DmBpEventData).bpType);
          console.log((mediaStateEventData as DmBpEventData).bpIndex);
          console.log((mediaStateEventData as DmBpEventData).buttonNumber);
          console.log((mediaStateEventData as DmBpEventData).pressContinuous);

          /*
oncontroldown invoked: 0
BP Event received
dispatchedEvent.data
0

bpEventData
bp900
a
0
null

BP Event received
dispatchedEvent.data
0

bpEventData
bp900
a
1
null
          */
          console.log('(mediaStateEventData as DmBpEventData).buttonNumber.toString().length');
          console.log((mediaStateEventData as DmBpEventData).buttonNumber.toString().length);
          console.log('isString(dispatchedEvent.data)');
          console.log(isString(dispatchedEvent.data));
          if (isString(dispatchedEvent.data)) {
            console.log('dispatchedEvent.data.length');
            console.log(dispatchedEvent.data.length);
          }
          if ((mediaStateEventData as DmBpEventData).buttonNumber === dispatchedEvent.data) {
            return mediaStateEvent;
          }
          break;
        // TODO - is this correct for timer? what about multiple timers?
        // TODO - what about other EventType's?
        case EventType.Timer:
          return mediaStateEvent;
        case EventType.MediaEnd:
          return mediaStateEvent;
        default:
          break;
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
    const hState: HState | null = getHStateById(autorunStateFromState(getState()), hStateId);
    if (!isNil(hState)) {
      const mediaHState: MediaHState = hState as MediaHState;
      if (!isNil(mediaHState.data.mediaStateData)) {
        if (isNumber(mediaHState.data.mediaStateData.timeoutId)) {
          clearTimeout(mediaHState.data.mediaStateData.timeoutId);
          // TEDTODO - is it okay to dispatch an action inside of a whatever
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
          const timeoutId: number =
            setTimeout(timeoutEventHandler, interval * 1000, timeoutEventCallbackParams) as unknown as number;
          dispatch(setMediaHStateTimeoutId(hState.id, timeoutId));
        }
      }
    }
  };
};

const timeoutEventHandler = (callbackParams: TimeoutEventCallbackParams): void => {
  const event: HsmEventType = {
    EventType: EventType.Timer,
    EventData: HsmTimerType.MediaHState,
  };
  callbackParams.dispatch(addHsmEvent(event));
};

export const keydownEventHandler = (keyName: string): any => {
  return (dispatch: AutorunDispatch, getState: () => any) => {

    // TEDTODO - get the current state - not sure what the actual right way to do this is.
    // const autorunState = autorunStateFromState(getState());
    // const hsmMap: HsmMap = getHsmMap(autorunState);
    // for (const hsmId in hsmMap) {
    //   if (Object.prototype.hasOwnProperty.call(hsmMap, hsmId)) {
    //     const hsm: Hsm = hsmMap[hsmId];
    //     // TEDTODO - total hack!!
    //     if (hsm.type === HsmType.VideoOrImages) {
    //       const activeHState: HState | null = getActiveHStateIdByHsmId(autorunState, hsm.id);
    //       if (!isNil(activeHState)) {
    //         console.log('activeHState: ', activeHState);
    //       }
    //     }
    //   }
    // }
    // TEDTODO - doesn't look like the current state is used / needed???? It's retrieved elsewhere.

    const event: HsmEventType = {
      EventType: EventType.Keyboard,
      EventData: HsmKeydownType.MediaHState,
      data: keyName,
    };
    dispatch(addHsmEvent(event));
  };
};

export const bpEventHandler = (code: string): any => {
  return (dispatch: AutorunDispatch, getState: () => any) => {
    const event: HsmEventType = {
      EventType: EventType.Bp,
      EventData: HsmKeydownType.MediaHState,
      data: code,
    };
    dispatch(addHsmEvent(event));
  };
};
