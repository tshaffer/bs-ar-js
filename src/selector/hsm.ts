import {
  AutorunState,
  Hsm,
  HState,
  HStateMap,
  HsmEventType,
  MediaZoneHsmProperties,
  ZoneHsmProperties,
  autorunStateFromState,
  MediaHState,
  MrssStateData,
} from '../type';
import { find, isNil, isString } from 'lodash';
import { HsmMap } from '../type';
import { DmDerivedContentItem, dmFilterDmState, dmGetMediaStateById } from '@brightsign/bsdatamodel';
import { ContentItemType } from '@brightsign/bscore';

// ------------------------------------
// Selectors
// ------------------------------------
export function getHsmMap(state: any): HsmMap {
  const autorunState: AutorunState = autorunStateFromState(state);
  return autorunState.bsPlayer.hsmState.hsmById;
}

export function getHsmById(state: any, hsmId: string): Hsm {
  const autorunState: AutorunState = autorunStateFromState(state);
  return autorunState.bsPlayer.hsmState.hsmById[hsmId];
}

export function getHsmByName(
  state: AutorunState,
  hsmName: string
): Hsm | null {
  const autorunState: AutorunState = autorunStateFromState(state);
  const hsmMap: HsmMap = getHsmMap(autorunState);
  const hsmId = find(Object.keys(hsmMap), (id) => hsmMap[id].name === hsmName);
  return hsmId ? getHsmById(autorunState, hsmId) : null;
}

export const getActiveHStateIdByHsmId = (
  state: AutorunState,
  hsmId: string
): HState | null => {
  const autorunState: AutorunState = autorunStateFromState(state);
  const hsm: Hsm = getHsmById(autorunState, hsmId);
  if (!isNil(hsm)) {
    return getHStateById(autorunState, hsm.activeStateId);
  }
  return null;
};

export function getHStateById(state: any, hStateId: string | null): HState | null {
  const autorunState: AutorunState = autorunStateFromState(state);
  if (isNil(hStateId)) {
    return null;
  }
  const hState = autorunState.bsPlayer.hsmState.hStateById[hStateId as string];
  if (isNil(hState)) {
    debugger;
  }
  return hState;
}

export function getHStateByName(state: any, name: string | null): HState | null {
  const autorunState: AutorunState = autorunStateFromState(state);

  if (isNil(name)) {
    return null;
  }

  const hStateMap: HStateMap = autorunState.bsPlayer.hsmState.hStateById;

  const hStateId = find(Object.keys(hStateMap), (id) => {
    if (Object.prototype.hasOwnProperty.call(hStateMap, id)) {
      const hState = hStateMap[id];
      return (hState.name === name);
    }
    return false;
  });

  return hStateId ? getHStateById(autorunState, hStateId) : null;
}

export function getHStateByMediaStateId(state: any, hsmId: string, mediaStateId: string | null): HState | null {
  const autorunState: AutorunState = autorunStateFromState(state);

  if (isNil(mediaStateId)) {
    return null;
  }

  const hsm: Hsm = getHsmById(autorunState, hsmId);

  // TEDTODO - near term hack...
  const staleHState = (hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState[mediaStateId as string];
  const hStateId = staleHState.id;
  const hState = getHStateById(state, hStateId);
  return hState;
  // the following may return a stale hState. why? after properties are set on hState?
  // return (hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState[mediaStateId as string];
}

export function getHsmInitialized(state: any, hsmId: string): boolean {
  const autorunState: AutorunState = autorunStateFromState(state);

  return autorunState.bsPlayer.hsmState.hsmById[hsmId].initialized;
}

export function getZoneHsmList(state: any): Hsm[] {
  const autorunState: AutorunState = autorunStateFromState(state);

  const hsmList: Hsm[] = [];
  const hsmById: HsmMap = autorunState.bsPlayer.hsmState.hsmById;
  for (const hsmId in hsmById) {
    if (Object.prototype.hasOwnProperty.call(hsmById, hsmId)) {
      const hsm: Hsm = hsmById[hsmId];
      if (hsm.type === 'VideoOrImages') {
        hsmList.push(hsm);
      }
    }
  }
  return hsmList;
}

export function getZoneHsmFromZoneId(state: any, zoneId: string): Hsm | null {
  const autorunState: AutorunState = autorunStateFromState(state);
  const zoneHsmList: Hsm[] = getZoneHsmList(autorunState);
  for (const zoneHsm of zoneHsmList) {
    if (!isNil(zoneHsm.properties)) {
      if (isString((zoneHsm.properties as ZoneHsmProperties).zoneId)) {
        if ((zoneHsm.properties as ZoneHsmProperties).zoneId === zoneId) {
          return zoneHsm;
        }
      }
    }
  }
  return null;
}

export function getActiveMediaStateId(state: any, zoneId: string): string {
  const autorunState: AutorunState = autorunStateFromState(state);
  const zoneHsm: Hsm | null = getZoneHsmFromZoneId(state, zoneId);
  if (!isNil(zoneHsm)) {
    const activeHStateId: string = zoneHsm.activeStateId as string;
    const activeHState = getHStateById(autorunState, activeHStateId);
    if (!isNil(activeHState)) {
      return (activeHState as MediaHState).data.mediaStateId;
    }
    return zoneHsm.activeStateId as string;
  }
  return '';
}

export function getActiveMrssDisplayIndex(state: any, zoneId: string): number {
  // TEDTODO - the following is called here and in getActiveMediaStateId - fix this
  const zoneHsm: Hsm | null = getZoneHsmFromZoneId(state, zoneId);
  if (!isNil(zoneHsm)) {
    const mediaStateId = getActiveMediaStateId(state, zoneId);
    const mediaState = dmGetMediaStateById(dmFilterDmState(state), { id: mediaStateId });
    if (!isNil(mediaState)) {
      const contentItem: DmDerivedContentItem = mediaState.contentItem;
      if (contentItem.type === ContentItemType.MrssFeed) {
        const mrssState = getHStateByMediaStateId(state, zoneHsm.id, mediaStateId) as MediaHState;
        if (!isNil(mrssState)) {
          const mrssStateData: MrssStateData = mrssState.data.mediaStateData! as MrssStateData;
          const displayIndex: number = mrssStateData.displayIndex;
          return displayIndex;
        }
      }
    }
  }

  return -1;
}

export function getEvents(state: any): HsmEventType[] {
  const autorunState: AutorunState = autorunStateFromState(state);
  return autorunState.bsPlayer.hsmState.hsmEventQueue;
}

export const getIsHsmInitialized = (state: any): boolean => {
  const autorunState: AutorunState = autorunStateFromState(state);
  const hsmMap: HsmMap = getHsmMap(autorunState);
  for (const hsmId in hsmMap) {
    if (Object.prototype.hasOwnProperty.call(hsmMap, hsmId)) {
      const hsm: Hsm = hsmMap[hsmId];
      if (!hsm.initialized) {
        return false;
      }
    }
  }

  return true;
};
