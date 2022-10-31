import { getHStateByMediaStateId } from './hsm';
import {
  MediaHState,
  MediaHStateData,
  MrssStateData,
  ArMrssFeed,
  ArDataFeedMap,
  AutorunPlayerState,
  ArMrssItem,
} from '../type';

import { getHsmById } from './hsm';
import { Hsm } from '../type';
import { getFeedPoolFilePath } from './presentation';
import { getSHA1 } from '../controller/dataFeed';

export function getMrssItemFilePath(state: any, mediaStateId: string): string {

  const hsmById = state.bsPlayer.hsmState.hsmById;
  const hsmIds = Object.keys(hsmById);
  for (const hsmId of hsmIds) {
    const hsm: Hsm = getHsmById(state, hsmId);
    if (hsm.type === 'VideoOrImages') {
      const mediaHState: MediaHState = getHStateByMediaStateId(state, hsm.id, mediaStateId) as MediaHState;
      const data: MediaHStateData = mediaHState.data;
      const mediaStateData = data.mediaStateData!;

      const bsPlayer: AutorunPlayerState = state.bsPlayer;
      const arDataFeeds: ArDataFeedMap = bsPlayer.arDataFeeds;
      const arMrssFeed: ArMrssFeed = arDataFeeds[(mediaStateData as MrssStateData).dataFeedId] as ArMrssFeed;

      const displayIndex: number = (mediaStateData as MrssStateData).displayIndex;

      const mrssItem: ArMrssItem = arMrssFeed.mrssItems[displayIndex];
      const generatedHashGuid = getSHA1(mrssItem.url + mrssItem.guid);
      return getFeedPoolFilePath(state, generatedHashGuid);

    }
  }

  return '';
}
