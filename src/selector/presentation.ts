import { isNil, isString } from 'lodash';
import * as fs from 'fs-extra';
import isomorphicPath from 'isomorphic-path';

import {
  AutorunState,
  SyncSpecDownload,
  AutorunSchedule,
  SyncSpecFileMap,
  autorunStateFromState,
  RuntimeEnvironment,
  FileLUT,
  Dimensions,
} from '../type';
import { DmState, dmFilterDmState, dmGetAssetItemListForFileName } from '@brightsign/bsdatamodel';
import { BsAssetItem } from '@brightsign/bscore';

// ------------------------------------
// Selectors
// ------------------------------------
export function getRuntimeEnvironment(state: any): RuntimeEnvironment {

  const autorunState: AutorunState = autorunStateFromState(state);

  if (
    !isNil(autorunState.bsPlayer)
    && !isNil(autorunState.bsPlayer.presentationData)) {
    return autorunState.bsPlayer.presentationData.runtimeEnvironment;
  }
  return RuntimeEnvironment.Dev;
}

export function getSrcDirectory(state: any): string {
  const autorunState: AutorunState = autorunStateFromState(state);
  if (
    !isNil(autorunState.bsPlayer)
    && !isNil(autorunState.bsPlayer.presentationData)
    && !isNil(autorunState.bsPlayer.presentationData.srcDirectory)) {
    return autorunState.bsPlayer.presentationData.srcDirectory;
  }
  return '';
}

export function getScreenDimensions(state: any): Dimensions {
  const autorunState: AutorunState = autorunStateFromState(state);
  if (
    !isNil(autorunState.bsPlayer)
    && !isNil(autorunState.bsPlayer.presentationData)
    && !isNil(autorunState.bsPlayer.presentationData.screenDimensions)) {
    return autorunState.bsPlayer.presentationData.screenDimensions;
  }
  return { width: 1920, height: 1080 };
}

export const getSyncSpecFileMap = (state: AutorunState): SyncSpecFileMap | null => {
  state = autorunStateFromState(state);
  if (!isNil(state.bsPlayer)
    && !isNil(state.bsPlayer.presentationData)) {
    return state.bsPlayer.presentationData.syncSpecFileMap;
  }
  return null;
};

export const getAutoschedule = (state: any): AutorunSchedule | null => {

  const autorunState: AutorunState = autorunStateFromState(state);

  if (!isNil(autorunState.bsPlayer)
    && !isNil(autorunState.bsPlayer.presentationData)) {
    return autorunState.bsPlayer.presentationData.autoSchedule;
  }
  return null;
};

function getPoolAssetFiles(state: AutorunState): FileLUT {
  state = autorunStateFromState(state);

  const poolAssetFiles: FileLUT = {};

  const syncSpecFileMap = getSyncSpecFileMap(state);

  const rootDirectory = getSrcDirectory(state);

  if (!isNil(syncSpecFileMap) && isString(rootDirectory)) {
    for (const fileName in syncSpecFileMap) {
      if (Object.prototype.hasOwnProperty.call((syncSpecFileMap), fileName)) {
        const syncSpecDownload: SyncSpecDownload = syncSpecFileMap[fileName];
        poolAssetFiles[fileName] = isomorphicPath.join(rootDirectory, syncSpecDownload.link);
      }
    }
  }

  return poolAssetFiles;
}

export function getPathFromAssetName(state: AutorunState, assetName: string): string {
  const bsdm: DmState = dmFilterDmState(state);
  const assetItems: BsAssetItem[] = dmGetAssetItemListForFileName(bsdm, { name: assetName });
  if (assetItems.length === 1) {
    const assetItem: BsAssetItem = assetItems[0];
    const filePath: string = isomorphicPath.join(assetItem.path, assetItem.name);
    return filePath;
  }
  return '';
}

export function getAssetPath(state: AutorunState, assetName: string): string {

  const runtimeEnvironment: RuntimeEnvironment = getRuntimeEnvironment(state);
  switch (runtimeEnvironment) {
    case RuntimeEnvironment.BaconPreview:
      return getPathFromAssetName(state, assetName);
    case RuntimeEnvironment.Dev:
      return getPoolFilePath(state, assetName);
    case RuntimeEnvironment.BrightSign:
      return getPoolFilePath(state, assetName);
    default:
      break;
  }
  return '';
}

function getPoolFilePath(state: AutorunState, fileName: string): string {
  state = autorunStateFromState(state);
  return getPoolAssetFiles(state)[fileName];
}

export const getSyncSpecFile = (state: AutorunState, fileName: string): Promise<any> => {
  state = autorunStateFromState(state);

  const syncSpecFileMap = getSyncSpecFileMap(state);
  if (isNil(syncSpecFileMap)) {
    return Promise.reject('No sync spec');
  }

  if (!Object.prototype.hasOwnProperty.call((syncSpecFileMap as SyncSpecFileMap), fileName)) {
    return Promise.reject('file not found');
  }
  const syncSpecFile: SyncSpecDownload = (syncSpecFileMap as SyncSpecFileMap)[fileName];

  const rootDirectory = getSrcDirectory(state);

  const filePath: string = isomorphicPath.join(rootDirectory, syncSpecFile.link);

  return fs.readFile(filePath, 'utf8')
    .then((fileStr: string) => {
      const file: object = JSON.parse(fileStr);
      return Promise.resolve(file);
    });
};

export function getSyncSpecReferencedFile(fileName: string, syncSpecFileMap: SyncSpecFileMap, rootPath: string): Promise<object> {

  if (!Object.prototype.hasOwnProperty.call((syncSpecFileMap), fileName)) {
    return Promise.reject('file not found');
  }
  const syncSpecFile: SyncSpecDownload = syncSpecFileMap[fileName];

  // const fileSize = syncSpecFile.size;
  const filePath: string = isomorphicPath.join(rootPath, syncSpecFile.link);

  return fs.readFile(filePath, 'utf8')
    .then((fileStr: string) => {

      const file: object = JSON.parse(fileStr);

      // I have commented out the following code to allow hacking of files -
      // that is, overwriting files in the pool without updating the sync spec with updated sha1
      // if (fileSize !== fileStr.length) {
      //   debugger;
      // }
      return Promise.resolve(file);
    });
}

export function getFeedPoolDirectory(state: any): string {
  const rootDirectory = getSrcDirectory(state);
  return isomorphicPath.join(rootDirectory, 'feedPool');
}

export function getFeedPoolFilePath(state: any, hashValue: string): string {
  const feedPoolDirectory = getFeedPoolDirectory(state);
  const hashValueLength = hashValue.length;
  const dir1 = hashValue.substring(hashValueLength - 2, hashValueLength - 1);
  const dir2 = hashValue.substring(hashValueLength - 1, hashValueLength);
  // TEDTODO
  const feedFileName = 'nohash-' + hashValue;
  return isomorphicPath.join(feedPoolDirectory, dir1, dir2, feedFileName);
}

export function feedPoolFileExists(state: any, hashValue: string): string {
  const feedPoolDirectory = getFeedPoolDirectory(state);
  const hashValueLength = hashValue.length;
  const dir1 = hashValue.substring(hashValueLength - 2, hashValueLength - 1);
  const dir2 = hashValue.substring(hashValueLength - 1, hashValueLength);
  // TEDTODO
  const feedFileName = 'nohash-' + hashValue;
  const feedPoolPath: string = isomorphicPath.join(feedPoolDirectory, dir1, dir2, feedFileName);
  if (feedPoolPath !== '' && fs.existsSync(feedPoolPath)) {
    return feedPoolPath;
  }
  return '';
}

export function getFeedCacheRoot(state: any): string {
  const rootDirectory = getSrcDirectory(state);
  return isomorphicPath.join(rootDirectory, 'feed_cache');
}
