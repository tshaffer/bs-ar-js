import * as fs from 'fs-extra';
import { ArDataFeed, ArMrssItem, ArMrssFeed, ArContentFeed, autorunStateFromState } from '../type';
import { Asset } from '@brightsign/assetpool';
import { getFeedPoolFilePath } from './presentation';
import { getSHA1 } from '../controller/dataFeed';

// ------------------------------------
// Selectors
// ------------------------------------
export function getDataFeedById(state: any, dataFeedId: string): ArDataFeed | null {
  const dataFeedsById = autorunStateFromState(state).bsPlayer.arDataFeeds;
  return dataFeedsById[dataFeedId];
}

export function getMrssFeedItems(feed: any): ArMrssItem[] {

  const feedItems: ArMrssItem[] = [];

  const items: any = feed.rss.channel.item;
  for (const item of items) {
    const mediaContent: any = item['media:content'].$;
    const feedItem: ArMrssItem = {
      guid: item.guid,
      link: item.link,
      title: item.title,
      pubDate: item.pubDate,
      duration: mediaContent.duration,
      fileSize: mediaContent.fileSize,
      medium: mediaContent.medium,
      type: mediaContent.type,
      url: mediaContent.url,
    };

    feedItems.push(feedItem);
  }
  return feedItems;
}

export function allDataFeedContentExists(state: any, dataFeed: ArMrssFeed | ArContentFeed): boolean {
  for (const mrssItem of (dataFeed as ArMrssFeed).mrssItems) {
    const filePath = getFeedPoolFilePathFromMrssItem(state, mrssItem);
    if (filePath === '' || !fs.existsSync(filePath)) {
      return false;
    }
  }
  return true;
}

export function dataFeedContentExists(state: any, dataFeed: ArMrssFeed): boolean {
  for (const mrssItem of dataFeed.mrssItems) {
    const filePath = getFeedPoolFilePathFromMrssItem(state, mrssItem);
    if (filePath !== '' && fs.existsSync(filePath)) {
      return true;
    }
  }
  return false;
}

export function getFeedPoolFilePathFromMrssItem(state: any, mrssItem: ArMrssItem): string {
  const generatedHashGuid = getSHA1(mrssItem.url + mrssItem.guid);
  return getFeedPoolFilePath(state, generatedHashGuid);
}

export function getFeedPoolFilePathFromAsset(state: any, asset: Asset): string {
  return getFeedPoolFilePath(state, asset.changeHint as string);
}
