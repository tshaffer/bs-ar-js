/* eslint-disable @typescript-eslint/no-var-requires */
import { isNil, isString } from 'lodash';
import isomorphicPath from 'isomorphic-path';
import * as fs from 'fs-extra';

import * as process from 'process';

import HostConfig from '@brightsign/hostconfiguration';

import {
  AutorunState, autorunStateFromState,
  RawSyncSpec,
  AutorunSchedule,
  SyncSpecFileMap,
  Dimensions,
} from '../type';
import {
  AutorunDispatch,
  AutorunVoidPromiseThunkAction,
  AutorunVoidThunkAction,
  updatePresentationSrcDirectory,
  updateRuntimeEnvironment,
  updateScreenDimensions,
} from '../model';
import { RuntimeEnvironment } from '../type';

import {
  updatePresentationAutoschedule,
  updatePresentationSyncSpecFileMap,
} from '../model/presentation';
import {
  getRuntimeEnvironment,
  getSrcDirectory,
  getSyncSpecFile,
  getAutoschedule,
  getSyncSpecFileMap,
  getSyncSpecReferencedFile
} from '../selector';
import { launchHsm } from './hsmController';
import { DmSignState, dmOpenSign } from '@brightsign/bsdatamodel';

export const initPresentation = (): AutorunVoidThunkAction => {
  return ((dispatch: AutorunDispatch) => {
    dispatch(loadPresentationData()).then(() => {
      dispatch(launchHsm() as any);
    });
  });
};

export const determineRuntimeEnvironment = (): Promise<any> => {

  let runtimeEnvironment: RuntimeEnvironment = RuntimeEnvironment.Dev;

  return new Promise((resolve, reject) => {
    const promise: Promise<string> = getHostConfig();
    promise.then((hostName: string) => {
      console.log('hostName: ', hostName);
      if (hostName !== 'myplayer') {
        runtimeEnvironment = RuntimeEnvironment.BrightSign;
      }
      return resolve(runtimeEnvironment);
    });
  });
};

const getHostConfig = (): Promise<string> => {
  const hc = new HostConfig();
  return hc.getConfig()
    .then((config: any) => {
      return Promise.resolve(config['hostName']);
    }).catch((e: any) => {
      console.log('hostConfig.getConfig error: ');
      console.log(e);
      return Promise.resolve('myplayer');
    });
};

const loadPresentationData = (): AutorunVoidPromiseThunkAction => {
  return ((dispatch: AutorunDispatch) => {

    let runtimeEnvironment: RuntimeEnvironment = RuntimeEnvironment.Dev;

    return getHostConfig()
      .then((hostName: string) => {
        if (hostName !== 'myplayer') {
          runtimeEnvironment = RuntimeEnvironment.BrightSign;
        }
        dispatch(updateRuntimeEnvironment(runtimeEnvironment));
        dispatch(setSrcDirectory());
        return dispatch(setSyncSpec())
          .then(() => {
            return dispatch(setAutoschedule());
          });
      });
  });
};

const setSrcDirectory = (): AutorunVoidThunkAction => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    const autorunState: AutorunState = autorunStateFromState(getState());
    const runtimeEnvironment: RuntimeEnvironment = getRuntimeEnvironment(autorunState);
    let srcDirectory = '';
    try {
      if (runtimeEnvironment === RuntimeEnvironment.Dev) {
        require('dotenv').config();

        let screenDimensions: Dimensions = {
          width: 1920,
          height: 1080,
        };
        if (isString(process.env.SCREEN_WIDTH) && isString(process.env.SCREEN_HEIGHT)) {
          screenDimensions = {
            width: parseInt(process.env.SCREEN_WIDTH, 10),
            height: parseInt(process.env.SCREEN_HEIGHT, 10),
          };
        }
        dispatch(updateScreenDimensions({ width: screenDimensions.width, height: screenDimensions.height }));
        srcDirectory = process.env.SOURCE_DIRECTORY as string;
      } else if (runtimeEnvironment === RuntimeEnvironment.BaconPreview) {
        srcDirectory = '/Users/tedshaffer/Desktop/autotron-2020';
      } else {
        srcDirectory = '';
        process.chdir('/storage/sd');
      }
    } catch (e) {
      console.log('setSrcDirectory error caught');
      console.log(e);
    }
    dispatch(updatePresentationSrcDirectory(srcDirectory));
  });
};

const setSyncSpec = (): AutorunVoidPromiseThunkAction => {
  return ((dispatch: AutorunDispatch, getState: () => any) => {
    const autorunState: AutorunState = autorunStateFromState(getState());
    const srcDirectory = getSrcDirectory(autorunState);
    return getSyncSpec(srcDirectory)
      .then((syncSpec) => {
        const syncSpecFileMap: SyncSpecFileMap = {};
        for (const syncSpecDownload of syncSpec.files.download) {
          syncSpecFileMap[syncSpecDownload.name] = syncSpecDownload;
        }
        dispatch(updatePresentationSyncSpecFileMap(syncSpecFileMap));
        return Promise.resolve();
      });
  });
};

const setAutoschedule = (): AutorunVoidPromiseThunkAction => {
  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {
    return new Promise((resolve, reject) => {
      const autorunState: AutorunState = autorunStateFromState(getState());
      getSyncSpecFile(autorunState, 'autoschedule.json')
        .then((autoSchedule: AutorunSchedule) => {
          dispatch(updatePresentationAutoschedule(autoSchedule));
          return resolve();
        });
    });
  });
};

function getSyncSpec(rootDirectory: string): Promise<RawSyncSpec> {
  return getSyncSpecFilePath(rootDirectory)
    .then((syncSpecFilePath: string | null) => {
      if (!syncSpecFilePath) {
        // TEDTODO - error object
        return Promise.reject('no sync spec found');
      } else {
        return Promise.resolve(readSyncSpec(syncSpecFilePath));
      }
    });
}

function getSyncSpecFilePath(rootDirectory: string): Promise<string | null> {
  return getLocalSyncSpec(rootDirectory)
    .then((localSyncSpecFilePath) => {
      if (isNil(localSyncSpecFilePath)) {
        return getNetworkedSyncSpec(rootDirectory);
      } else {
        return Promise.resolve(localSyncSpecFilePath);
      }
    });
}

function getNetworkedSyncSpec(rootDirectory: string): Promise<string | null> {
  const filePath: string = getNetworkedSyncSpecFilePath(rootDirectory);
  return fs.pathExists(filePath)
    .then((exists: boolean) => {
      if (exists) {
        return Promise.resolve(filePath);
      } else {
        return Promise.resolve(null);
      }
    });
}

function getLocalSyncSpec(rootDirectory: string): Promise<string | null> {
  const filePath: string = getLocalSyncSpecFilePath(rootDirectory);
  return fs.pathExists(filePath)
    .then((exists: boolean) => {
      if (exists) {
        return Promise.resolve(filePath);
      } else {
        return Promise.resolve(null);
      }
    });
}

function getLocalSyncSpecFilePath(rootDirectory: string): string {
  return isomorphicPath.join(rootDirectory, 'local-sync.json');
}

function getNetworkedSyncSpecFilePath(rootDirectory: string): string {
  return isomorphicPath.join(rootDirectory, 'current-sync.json');
}

function readSyncSpec(syncSpecFilePath: string): Promise<RawSyncSpec> {
  return fs.readFile(syncSpecFilePath, 'utf8')
    .then((syncSpecStr: string) => {
      const syncSpec: RawSyncSpec = JSON.parse(syncSpecStr);
      return Promise.resolve(syncSpec);
    });
}

export const openSign = (presentationName: string) => {

  return ((dispatch: AutorunDispatch, getState: () => AutorunState) => {

    const autoSchedule: AutorunSchedule | null = getAutoschedule(autorunStateFromState(getState()));
    if (!isNil(autoSchedule)) {

      //  - only a single scheduled item is currently supported
      const scheduledPresentation = autoSchedule!.scheduledPresentations[0];
      const presentationToSchedule = scheduledPresentation.presentationToSchedule;
      presentationName = presentationToSchedule.name;
      const autoplayFileName = presentationName + '.bml';

      const syncSpecFileMap = getSyncSpecFileMap(autorunStateFromState(getState()));
      if (!isNil(syncSpecFileMap)) {
        return getSyncSpecReferencedFile(
          autoplayFileName,
          syncSpecFileMap!,
          getSrcDirectory(autorunStateFromState(getState())))
          .then((bpfxState: any) => {
            const autoPlay: any = bpfxState.bsdm;
            const signState = autoPlay as DmSignState;
            dispatch(dmOpenSign(signState));
          });
      }
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  });
};
