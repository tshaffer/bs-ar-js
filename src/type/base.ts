/** @module Types:base */

import { DmState } from '@brightsign/bsdatamodel';
import { BaContextModelState } from '@brightsign/ba-context-model';

import { HsmState } from './hsm';
import { PresentationDataState } from './presentation';
import { PlaybackState } from './playback';
import { ArDataFeedMap } from './dataFeed';

export class RuntimeEnvironment {
  static BrightSign = 'BrightSign';
  static BaconPreview = 'BaconPreview';
  static Dev = 'Dev';
}
Object.freeze(RuntimeEnvironment);

export interface AutorunState {
  bsdm: DmState;
  bacdm: BaContextModelState;
  bsPlayer: AutorunPlayerState;
}

export interface AutorunPlayerState {
  hsmState: HsmState;
  presentationData: PresentationDataState;
  playback: PlaybackState;
  arDataFeeds: ArDataFeedMap;
}

/** @internal */
/** @private */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface LUT { [key: string]: any; }

export interface AutorunBaseObject {
  id: string;
}

export interface AutorunMap<T extends AutorunBaseObject> {
  [id: string]: T;    // really '[id:BsDmId]: T;' -- but Typescript doesn't like that, even though BsDmId = string
}

export interface FileLUT { [fileName: string]: string; }

export interface Position {
  left: number;
  top: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface CanvasRenderProperties {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
  dx: number;
  dy: number;
  dWidth: number;
  dHeight: number;
}
export const autorunStateFromState = (state: any): AutorunState => {
  if (Object.prototype.hasOwnProperty.call(state, 'autorun')) {
    const autorunPlayerState: AutorunPlayerState = (state as any).bsPlayer;
    const autorunState: AutorunState = {
      bsdm: state.bsdm,
      bacdm: state.bacdm,
      bsPlayer: {
        playback: autorunPlayerState.playback,
        presentationData: autorunPlayerState.presentationData,
        hsmState: autorunPlayerState.hsmState,
        arDataFeeds: autorunPlayerState.arDataFeeds,
      }
    };
    return autorunState;
  } else if (Object.prototype.hasOwnProperty.call(state, 'bsPlayer')) {
    return state;
  } else {
    debugger;
    return state;
  }
};
