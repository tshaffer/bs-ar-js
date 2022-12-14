import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import axios from 'axios';

import { HsmEventType } from '../type';

import { ArTextItem, ArTextFeed, ArMrssItem, ArMrssFeed, ArContentFeedItem, ArContentFeed, ArDataFeed, ArFeed } from '../type/dataFeed';
import { DmState } from '@brightsign/bsdatamodel';
import {
  DmcDataFeed,
  DmRemoteDataFeedSource,
  DmParameterizedString,
  dmGetSimpleStringFromParameterizedString,
  dmGetDataFeedSourceForFeedId
} from '@brightsign/bsdatamodel';
import { isNil, isObject } from 'lodash';
import { DataFeedUsageType, DataFeedType } from '@brightsign/bscore';
import AssetPool, { Asset } from '@brightsign/assetpool';
import { addDataFeed } from '../model/dataFeed';
import { getMrssFeedItems, getDataFeedById, allDataFeedContentExists } from '../selector/dataFeed';

import AssetPoolFetcher from '@brightsign/assetpoolfetcher';

import { addHsmEvent } from './hsmController';
import { xmlStringToJson } from '../utility';
import {
  AutorunVoidPromiseThunkAction,
  AutorunVoidThunkAction,
} from '../model';
import { getFeedCacheRoot, getFeedAssetPool } from '../selector';

let assetPoolFetcher: AssetPoolFetcher | null = null;

// ******************** FEEDS: ********************/

// Promise is resolved with the raw data feed (xml converted to json)
export function retrieveDataFeed(state: any, bsdm: DmState, dataFeed: DmcDataFeed): Promise<ArFeed> {

  const dataFeedSource = dmGetDataFeedSourceForFeedId(bsdm, { id: dataFeed.id });
  if (isNil(dataFeedSource)) {
    // console.log('******** retrieveDataFeed - dataFeedSource not found.');
    // debugger;
  }

  const remoteDataFeedSource: DmRemoteDataFeedSource = dataFeedSource as DmRemoteDataFeedSource;
  const urlPS: DmParameterizedString = remoteDataFeedSource.url;
  const url: string | null = dmGetSimpleStringFromParameterizedString(urlPS);
  if (!isNil(url)) {
    return axios({
      method: 'get',
      url,
      responseType: 'text',
    }).then((response: any) => {
      fs.writeFileSync(getFeedCacheRoot(state) + dataFeed.id + '.xml', response.data);
      return xmlStringToJson(response.data);
    }).then((feedAsJson: ArFeed) => {
      // console.log(feedAsJson);
      return Promise.resolve(feedAsJson);
    }).catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
  }
  return Promise.reject('dataFeedSources url is null');
}

export function readCachedFeed(state: any, bsdmDataFeed: DmcDataFeed): Promise<ArFeed | null> {

  const feedFileName: string = getFeedCacheRoot(state) + bsdmDataFeed.id + '.xml';

  // console.log('Read existing content for feed ' + bsdmDataFeed.id);

  let xmlFileContents: string;

  try {

    xmlFileContents = fs.readFileSync(feedFileName, 'utf8');

    return xmlStringToJson(xmlFileContents)
      .then((feed: ArFeed) => {
        // console.log(feed);
        return Promise.resolve(feed);
      }).catch((err) => {
        // TODODF - if err is for file not found
        return Promise.resolve(null);
      });
  } catch (err) {
    // return Promise.reject(err);
    // TODODF
    return Promise.resolve(null);
  }
}

export function processFeed(bsdmDataFeed: DmcDataFeed, feed: ArFeed): AutorunVoidPromiseThunkAction {
  return (dispatch: any, getState: any) => {
    switch (bsdmDataFeed.usage) {
      case DataFeedUsageType.Mrss: {
        return dispatch(processMrssFeed(bsdmDataFeed, feed));
      }
      case DataFeedUsageType.Content: {
        return dispatch(processContentFeed(bsdmDataFeed, feed));
      }
      case DataFeedUsageType.Text: {
        return dispatch(processTextDataFeed(bsdmDataFeed, feed));
      }
      default:
        return Promise.resolve();
    }
  };

}

// ******************** MRSS FEEDS: ********************/

function processMrssFeed(bsdmDataFeed: DmcDataFeed, feed: ArFeed): AutorunVoidPromiseThunkAction {

  return (dispatch: any, getState: any) => {

    // const isMrssFeed: boolean = feedIsMrss(rawFeed);
    const isMrssFeed = true;
    if (!isMrssFeed) {
      return Promise.resolve();
    }

    const items: ArMrssItem[] = getMrssFeedItems(feed);
    // console.log(items);

    const assetList: Asset[] = generateMrssFeedAssetList(items);

    console.log('assetList access 0');
    const dataFeed: ArMrssFeed = {
      type: 'mrss',
      id: bsdmDataFeed.id,
      usage: DataFeedUsageType.Mrss,
      sourceId: bsdmDataFeed.feedSourceId,
      mrssItems: items,
      assetList,
      title: 'notSure',
      playtime: '',
      ttl: '',
    };
    const addDataFeedAction: any = addDataFeed(bsdmDataFeed.id, dataFeed);
    dispatch(addDataFeedAction);
    return Promise.resolve();

  };
}

export function getSHA1(data: string): string {
  const hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
}

function generateMrssFeedAssetList(contentItems: ArMrssItem[]): Asset[] {

  const assetList: Asset[] = [];

  for (const feedItem of contentItems) {
    const asset: Asset = {
      name: feedItem.url,
      link: feedItem.url,
      changeHint: feedItem.guid,
    };
    assetList.push(asset);
  }

  return assetList;
}

export function downloadMRSSFeedContent(arDataFeed: ArMrssFeed) {

  return (dispatch: any, getState: any) => {

    console.log('downloadMRSSFeedContent');

    const dataFeed: ArDataFeed | null = getDataFeedById(getState(), arDataFeed.id) as ArDataFeed;
    console.log('dataFeed');
    if (isNil(dataFeed)) {
      console.log('dataFeed is null');
    } else {
      console.log('dataFeed is non null, sourceId: ');
      console.log(dataFeed.sourceId);
    }
    const feedAssetPool: AssetPool = getFeedAssetPool(getState());
    assetPoolFetcher = new AssetPoolFetcher(feedAssetPool);

    assetPoolFetcher.addEventListener('progressevent', (data: any) => {
      // ProgressEvent is defined at
      // https://docs.brightsign.biz/display/DOC/assetpoolfetcher#assetpoolfetcher-Events
      console.log('progressEvent:');
      console.log(data.detail.fileName);
      console.log(data.detail.index);
      console.log(data.detail.total);
      console.log(data.detail.currentFileTransferred);
      console.log(data.detail.currentFileTotal);
    });

    assetPoolFetcher.addEventListener('fileevent', (data: any) => {
      // FileEvent is at data.detail
      // https://docs.brightsign.biz/display/DOC/assetpoolfetcher#assetpoolfetcher-Events
      console.log('fileEvent:');
      console.log(data.detail.fileName);
      console.log(data.detail.index);
      console.log(data.detail.responseCode);
      console.log(data.detail.error);
    });

    console.log('post MRSS_SPEC_UPDATED message');

    // indicate that the mrss spec has been updated
    const event: HsmEventType = {
      EventType: 'MRSS_SPEC_UPDATED',
      // EventData: dataFeedSource.id,
      EventData: dataFeed.id,
    };
    const action: any = addHsmEvent(event);
    dispatch(action);

    // console.log('assetPoolFetcher.start');
    console.log('assetList access 1');

    const mrssFeed: ArMrssFeed = dataFeed as ArMrssFeed;
    console.log('mrssFeed');
    console.log('title: ', mrssFeed.title);
    console.log('playTime: ', mrssFeed.playtime);
    console.log('assetList length: ', mrssFeed.assetList.length);
    console.log('mrssItems length: ', mrssFeed.mrssItems.length);

    assetPoolFetcher.start((dataFeed as ArMrssFeed).assetList)
      .then(() => {
        // console.log('assetPoolFetcher promise resolved');

        // after all files complete
        const actionEvent: HsmEventType = {
          EventType: 'MRSS_DATA_FEED_LOADED',
          // EventData: dataFeedSource.id,
          EventData: dataFeed.id,
        };
        const actionToPost: any = addHsmEvent(actionEvent);
        dispatch(actionToPost);
      })
      .catch((err: any) => {
        console.log('err caught in assetPoolFetcher.start');
        console.log(err);
        debugger;
      });
  };
}

// ******************** CONTENT FEEDS: BSN & BS  ********************/

function processContentFeed(bsdmDataFeed: DmcDataFeed, feed: ArFeed): AutorunVoidPromiseThunkAction {
  return (dispatch: any, getState: any) => {
    return dispatch(loadContentFeed(bsdmDataFeed, feed));
  };
}

function loadContentFeed(bsdmDataFeed: DmcDataFeed, feed: ArFeed): AutorunVoidPromiseThunkAction {

  return (dispatch: any, getState: any) => {

    if (isBsnFeed(bsdmDataFeed)) {
      return dispatch(processBsnContentFeed(bsdmDataFeed, feed));
    } else {
      dispatch(processUrlContentFeed(bsdmDataFeed, feed));
      return Promise.resolve();
    }
  };
}

function generateContentFeedAssetList(contentItems: ArContentFeedItem[]): Asset[] {

  const assetList: Asset[] = [];

  for (const contentFeedItem of contentItems) {
    const asset: Asset = {
      name: contentFeedItem.name,
      link: contentFeedItem.url,
      changeHint: contentFeedItem.hash,
      hash: {
        method: 'SHA1',
        hex: contentFeedItem.hash,
      },
      probe: '',
      size: 0,
    };
    assetList.push(asset);
  }

  return assetList;
}

export function downloadContentFeedContent(arDataFeed: ArContentFeed) {

  return (dispatch: any, getState: any) => {

    // console.log('downloadContentFeedContent - entry');

    const feedAssetPool: AssetPool = getFeedAssetPool(getState());
    assetPoolFetcher = new AssetPoolFetcher(feedAssetPool);

    assetPoolFetcher.addEventListener('progressevent', (data: any) => {
      // console.log('progressEvent:');
      // console.log(data.detail.fileName);
      // console.log(data.detail.index);
      // console.log(data.detail.total);
      // console.log(data.detail.currentFileTransferred);
      // console.log(data.detail.currentFileTotal);
    });

    assetPoolFetcher.addEventListener('fileevent', (data: any) => {
      // FileEvent is at data.detail
      // https://docs.brightsign.biz/display/DOC/assetpoolfetcher#assetpoolfetcher-Events
      // console.log('fileEvent:');
      // console.log(data.detail.fileName);
      // console.log(data.detail.index);
      // console.log(data.detail.responseCode);
    });

    console.log('assetList access 2');
    assetPoolFetcher.start(arDataFeed.assetList)
      .then(() => {

        // post message indicating load complete
        const event: HsmEventType = {
          EventType: 'CONTENT_DATA_FEED_LOADED',
          EventData: arDataFeed.id,
        };
        const action: any = addHsmEvent(event);
        dispatch(action);
      })
      .catch((err: any) => {
        console.log('err caught in assetPoolFetcher.start');
        console.log(err);
      });
  };
}

// ******************** BSN CONTENT FEED ********************/

// returns a promise
function processBsnContentFeed(bsdmDataFeed: DmcDataFeed, feed: ArFeed): AutorunVoidPromiseThunkAction {
  return (dispatch: any, getState: any) => {
    return parseMrssFeed(feed)
      .then((mrssItems: ArMrssItem[]) => {
        const contentItems: ArContentFeedItem[] = convertMrssFormatToContentFormat(mrssItems);
        dispatch(addContentFeed(bsdmDataFeed, contentItems));
        return Promise.resolve();
      });
  };
}

function parseMrssFeed(feed: ArFeed) {
  const promise = populateFeedItems(feed);
  return promise.then((mrssItems: ArMrssItem[]) => {
    return Promise.resolve(mrssItems);
  });
}

function populateFeedItems(feed: ArFeed): Promise<ArMrssItem[]> {
  const items: ArMrssItem[] = getMrssFeedItems(feed);
  return Promise.resolve(items);
}

// convert to format required for content feed
function convertMrssFormatToContentFormat(mrssItems: ArMrssItem[]): ArContentFeedItem[] {
  const contentItems: ArContentFeedItem[] = [];
  for (const mrssItem of mrssItems) {
    const arContentItem: ArContentFeedItem = {
      name: mrssItem.title,
      url: mrssItem.url,
      medium: mrssItem.medium,
      hash: mrssItem.guid,
    };
    contentItems.push(arContentItem);
  }
  return contentItems;
}

// ******************** URL CONTENT FEED ********************/

function processUrlContentFeed(bsdmDataFeed: DmcDataFeed, urlFeed: ArFeed): AutorunVoidThunkAction {

  return (dispatch: any, getState: any) => {
    // TODO - can buildContentFeed return the arDataFeed it just created?
    dispatch(buildContentFeedFromUrlFeed(bsdmDataFeed, urlFeed));
    const arDataFeed = getDataFeedById(getState(), bsdmDataFeed.id) as ArDataFeed;
    if (!isNil(arDataFeed)) {
      if (allDataFeedContentExists(getState(), arDataFeed as ArContentFeed)) {
        const event: HsmEventType = {
          EventType: 'CONTENT_DATA_FEED_LOADED',
          EventData: arDataFeed.id,
        };
        const action: any = addHsmEvent(event);
        dispatch(action);
      }
    }
  };
}

function addContentFeed(bsdmDataFeed: DmcDataFeed, contentItems: ArContentFeedItem[]) {
  return (dispatch: any, getState: any) => {
    const assetList: Asset[] = generateContentFeedAssetList(contentItems);
    const arContentFeed: ArContentFeed = {
      type: 'content',
      id: bsdmDataFeed.id,
      sourceId: bsdmDataFeed.feedSourceId,
      usage: DataFeedUsageType.Content,
      contentItems,
      assetList,
    };
    const addDataFeedAction: any = addDataFeed(bsdmDataFeed.id, arContentFeed);
    dispatch(addDataFeedAction);
  };
}

function buildContentFeedFromUrlFeed(bsdmDataFeed: DmcDataFeed, urlFeed: ArFeed): AutorunVoidThunkAction {
  return (dispatch: any, getState: any) => {
    const contentItems: ArContentFeedItem[] = [];
    for (const item of urlFeed.rss.channel.item) {
      const arContentItem: ArContentFeedItem = {
        name: item.title,
        url: item.description,
        medium: item.medium,
        hash: item.guid,
      };
      contentItems.push(arContentItem);
    }
    dispatch(addContentFeed(bsdmDataFeed, contentItems));
  };
}

// ******************** TEXT FEED  ********************/

export function processTextDataFeed(bsdmDataFeed: DmcDataFeed, textFeed: ArFeed): AutorunVoidPromiseThunkAction {
  return (dispatch: any, getState: any) => {
    dispatch(parseSimpleRSSFeed(bsdmDataFeed, textFeed));
    return Promise.resolve();
  };
}

export function parseSimpleRSSFeed(bsdmDataFeed: DmcDataFeed, textFeed: ArFeed): AutorunVoidThunkAction {

  return (dispatch: any, getState: any) => {

    // const articles: string[] = [];
    // const articleTitles: string[] = [];
    const textItems: ArTextItem[] = [];
    const articlesByTitle: any = {};

    for (const feedItem of textFeed.rss.channel.item) {
      const title: string = feedItem.title;
      const description: string = feedItem.description;

      const arTextItem: ArTextItem = {
        articleTitle: title,
        articleDescription: description,
      };
      textItems.push(arTextItem);

      // articles.push(description);
      // articleTitles.push(title);
      articlesByTitle[title] = description;
    }

    const dataFeed: ArTextFeed = {
      type: 'text',
      id: bsdmDataFeed.id,
      usage: DataFeedUsageType.Text,
      sourceId: bsdmDataFeed.feedSourceId,
      textItems,
      articlesByTitle,
    };

    const addDataFeedAction: any = addDataFeed(bsdmDataFeed.id, dataFeed);
    dispatch(addDataFeedAction);
  };
}

// ******************** UTILIES / SHARED ********************/

function isBsnFeed(bsdmDataFeed: DmcDataFeed): boolean {
  // return true;
  return (bsdmDataFeed.isBsnDataFeed &&
    (bsdmDataFeed.type === DataFeedType.BSNDynamicPlaylist || bsdmDataFeed.type === DataFeedType.BSNMediaFeed));
}

// function fsSaveObjectAsLocalJsonFile(data: object, fullPath: string): Promise<void> {
//   const jsonString = JSON.stringify(data, null, 2);
//   console.log('invoke fs.writeFile');
//   console.log(fullPath);
//   return fs.writeFile(fullPath, jsonString);
// }

// function handleFileEvent(fileEvent: any) {
//   console.log('handleFileEvent');
//   console.log(fileEvent);
// }

// function handleProgressEvent(progressEvent: any) {
//   console.log('handleProgressEvent');
//   console.log(progressEvent);
// }

export function feedIsMrss(feed: any): boolean {

  if (isObject(feed) && isObject((feed as any).rss) && isObject((feed as any).rss.$)) {
    if ((feed as any).rss.$.hasOwnProperty('xmlns:media')) {
      const attr: string = (feed as any).rss.$['xmlns:media'];
      if (attr.startsWith('http://search.yahoo.com/mrss')) {
        return true;
      }
    }
  }

  return false;
}
