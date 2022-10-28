import * as React from 'react';
import { connect } from 'react-redux';

import { isString } from 'lodash';

import { ContentItemType, ImageModeType, ViewModeType, ZoneType } from '@brightsign/bscore';

import { BsDmId, DmImageZoneProperties, DmVideoZoneProperties, DmZoneSpecificProperties } from '@brightsign/bsdatamodel';
import { DmMediaState } from '@brightsign/bsdatamodel';
import { DmState } from '@brightsign/bsdatamodel';
import { DmZone } from '@brightsign/bsdatamodel';
import { DmEvent } from '@brightsign/bsdatamodel';
import { DmMediaContentItem } from '@brightsign/bsdatamodel';
import {
  DmDerivedContentItem,
  dmGetMediaStateById,
  dmGetEventIdsForMediaState,
  dmGetEventById,
  DmcEvent,
} from '@brightsign/bsdatamodel';

import { autorunStateFromState, Dimensions } from '../type';
import { getActiveMediaStateId } from '../selector';
import Image from './image';
import Video from './video';
import { calculateAspectRatioFit } from '../utility';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface MediaZonePropsFromParent {
  bsdm: DmState;
  zone: DmZone;
  zoneWidth: number;
  zoneHeight: number;
  screenDimensions: Dimensions;
}

export interface MediaZoneProps extends MediaZonePropsFromParent {
  mediaStateId: string;
  imageMode: ImageModeType;
  viewMode: ViewModeType;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------
const MediaZoneComponent = (props: any) => {

  const renderMediaItem = (mediaState: DmMediaState, contentItem: DmDerivedContentItem) => {

    const mediaContentItem: DmMediaContentItem = contentItem as DmMediaContentItem;

    const mediaType: ContentItemType = mediaContentItem.type;

    const scaledDimensions = calculateAspectRatioFit(
      props.zoneWidth,
      props.zoneHeight,
      props.screenDimensions.width,
      props.screenDimensions.height,
    );

    switch (mediaType) {
      case ContentItemType.Image: {
        return (
          <Image
            assetName={mediaState.name}
            zoneWidth={props.zoneWidth}
            zoneHeight={props.zoneHeight}
            screenDimensions={props.screenDimensions}
            imageMode={props.imageMode}
          />
        );
      }
      case ContentItemType.Video: {
        return (
          <Video
            assetName={mediaState.name}
            zoneWidth={scaledDimensions.width}
            zoneHeight={scaledDimensions.height}
          />
        );
      }
      default:
        debugger;
    }

    return null;
  };

  const getEvents = (bsdm: DmState, mediaStateId: string): DmEvent[] => {

    let events: DmEvent[] = [];

    const eventIds: BsDmId[] = dmGetEventIdsForMediaState(bsdm, { id: mediaStateId });

    events = eventIds.map((eventId) => {
      return dmGetEventById(bsdm, { id: eventId }) as DmcEvent;
    });

    return events;
  };

  if (!isString(props.mediaStateId) || props.mediaStateId.length === 0) {
    return null;
  }

  const mediaState: DmMediaState =
    dmGetMediaStateById(props.bsdm, { id: props.mediaStateId }) as DmMediaState;
  const contentItem: DmDerivedContentItem = mediaState.contentItem;

  switch (contentItem.type) {
    case ContentItemType.Image:
    case ContentItemType.Video: {
      return renderMediaItem(mediaState, contentItem as DmMediaContentItem);
    }
    default: {
      break;
    }
  }

  return null;
};

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (
  state: any,
  ownProps: MediaZonePropsFromParent
): Partial<MediaZoneProps> => {
  state = autorunStateFromState(state);
  const zone: DmZone = ownProps.zone;
  const zoneProperties: DmZoneSpecificProperties = zone.properties;

  let imageMode: ImageModeType = ImageModeType.ScaleToFill;
  let viewMode: ViewModeType = ViewModeType.ScaleToFill;

  switch (zone.type) {
    case ZoneType.Images: {
      imageMode = (zoneProperties as DmImageZoneProperties).imageMode;
      break;
    }
    case ZoneType.VideoOnly: {
      viewMode = (zoneProperties as DmVideoZoneProperties).viewMode;
      break;
    }
    case ZoneType.VideoOrImages: {
      imageMode = (zoneProperties as DmImageZoneProperties).imageMode;
      viewMode = (zoneProperties as DmVideoZoneProperties).viewMode;
      break;
    }
    default: {
      break;
    }
  }

  return {
    zone,
    imageMode,
    viewMode,
    mediaStateId: getActiveMediaStateId(state, ownProps.zone.id),
  };
};

export default connect(mapStateToProps)(MediaZoneComponent);
