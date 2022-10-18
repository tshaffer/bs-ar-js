import { createZoneHsm } from './zoneHsm';
import {
  DmZone,
  dmGetMediaStateIdsForZone,
  dmFilterDmState,
  DmState,
  DmMediaState,
  dmGetMediaStateById,
  BsDmId,
  dmGetInitialMediaStateIdForZone,
  // dmGetContainedMediaStateIdsForMediaState,
  // DmDataFeedContentItem,
  // DmcDataFeed,
  // dmGetDataFeedById,
} from '@brightsign/bsdatamodel';
import {
  MediaZoneHsmProperties,
  HState,
  HsmType,
  LUT,
  AutorunState,
  autorunStateFromState,
} from '../../type';
import {
  AutorunVoidThunkAction, AutorunAnyPromiseThunkAction, AutorunStringThunkAction, updateHsmProperties, AutorunDispatch,
} from '../../model';
import { ContentItemType } from '@brightsign/bscore';
import { createImageState } from './imageState';
import { createVideoState } from './videoState';
import { isNil, cloneDeep } from 'lodash';
import { Hsm } from '../../type';
import {
  setActiveHState,
} from '../../model';
import { getHsmById, getHStateById, getHStateByMediaStateId } from '../../selector';

export const createMediaZoneHsm = (hsmName: string, hsmType: HsmType, bsdmZone: DmZone): AutorunVoidThunkAction => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    const hsmData: MediaZoneHsmProperties = {
      zoneId: bsdmZone.id,
      x: bsdmZone.position.x,
      y: bsdmZone.position.y,
      height: bsdmZone.position.height,
      width: bsdmZone.position.width,
      initialMediaStateId: bsdmZone.initialMediaStateId,
      mediaStateIdToHState: {},
    };

    const hsmId: string = dispatch(createZoneHsm(hsmName, hsmType, hsmData));
    const hsm: Hsm = getHsmById(autorunStateFromState(getState()), hsmId);

    const bsdm: DmState = dmFilterDmState(autorunStateFromState(getState()));

    const mediaStateIds = dmGetMediaStateIdsForZone(bsdm, { id: bsdmZone.id });
    for (const mediaStateId of mediaStateIds) {
      const bsdmMediaState: DmMediaState = dmGetMediaStateById(bsdm, { id: mediaStateId }) as DmMediaState;
      dispatch(createMediaHState(hsmId, bsdmMediaState, hsm.topStateId));
    }
  });
};

const createMediaHState = (
  hsmId: string,
  bsdmMediaState: DmMediaState,
  superStateId: string
): AutorunStringThunkAction => {

  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    const hsm: Hsm = getHsmById(autorunStateFromState(getState()), hsmId);
    if (!isNil(hsm)) {
      const contentItemType = bsdmMediaState.contentItem.type;
      switch (contentItemType) {
        case ContentItemType.Image:
          const imageHStateId: string = dispatch(createImageState(hsmId, bsdmMediaState, superStateId));
          const imageHState: HState | null = getHStateById(autorunStateFromState(getState()), imageHStateId);
          const imageStateIdToHState: LUT = cloneDeep(hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState;
          imageStateIdToHState[bsdmMediaState.id] = imageHState;
          dispatch(updateHsmProperties({ id: hsmId, mediaStateIdToHState: imageStateIdToHState }));
          return imageHStateId;
        case ContentItemType.Video:
          const videoHStateId: string = dispatch(createVideoState(hsmId, bsdmMediaState, superStateId));
          const videoHState: HState | null = getHStateById(autorunStateFromState(getState()), videoHStateId);
          const videoStateIdToHState: LUT = cloneDeep(hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState;
          videoStateIdToHState[bsdmMediaState.id] = videoHState;
          dispatch(updateHsmProperties({ id: hsmId, mediaStateIdToHState: videoStateIdToHState }));
          return videoHStateId;
        default:
          return '';
      }
    }
    return '';
  });
};

export const initializeVideoOrImagesZoneHsm = (hsmId: string): AutorunVoidThunkAction => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {

    // get the initial media state for the zone
    const bsdm: DmState = dmFilterDmState(autorunStateFromState(getState()));
    const hsm: Hsm = getHsmById(autorunStateFromState(getState()), hsmId);
    if (hsm.type === HsmType.VideoOrImages) {

      const properties: MediaZoneHsmProperties = hsm.properties as MediaZoneHsmProperties;

      let activeState: HState | null = null;
      const initialMediaStateId: BsDmId | null =
        dmGetInitialMediaStateIdForZone(bsdm, { id: properties.zoneId });
      if (!isNil(initialMediaStateId)) {
        const initialMediaState: DmMediaState = dmGetMediaStateById(bsdm, { id: initialMediaStateId! }) as DmMediaState;
        activeState = getHStateByMediaStateId(autorunStateFromState(getState()), hsm.id, initialMediaState.id);
      }

      dispatch(setActiveHState(hsmId, activeState));
    }
  });
};

export const videoOrImagesZoneHsmGetInitialState = (hsmId: string): AutorunAnyPromiseThunkAction => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    const hsm: Hsm = getHsmById(autorunStateFromState(getState()), hsmId);
    const initialState = getHStateById(autorunStateFromState(getState()), hsm.activeStateId);
    return Promise.resolve(initialState);
  });
};
