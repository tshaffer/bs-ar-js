import * as React from 'react';
import { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getAssetPath } from '../selector';
import { autorunStateFromState } from '../type';
import { postVideoEnd } from '../controller';
import { setVideoElementRef } from '../model/playback';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface VideoPropsFromParent {
  assetName: string;
  zoneWidth: number;
  zoneHeight: number;
}

export interface VideoProps extends VideoPropsFromParent {
  filePath: string;
  onVideoEnd: () => any;
  onSetVideoElementRef: (videoElementRef: any) => any;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

const VideoComponent = (props: any) => {

  let videoElementRef: HTMLVideoElement | null;

  const handleSetVideoElementRef = (newVideoElementRef: HTMLVideoElement | null) => {
    videoElementRef = newVideoElementRef;
    props.onSetVideoElementRef(videoElementRef);
  };

  const src: string = isomorphicPath.join('file://', props.filePath);

  return (
    <video
      src={src}
      width={props.zoneWidth.toString()}
      height={props.zoneHeight.toString()}
      autoPlay={true}
      ref={(videoElementRef) => {
        handleSetVideoElementRef(videoElementRef);
      }}
      onEnded={() => {
        props.onVideoEnd();
      }}
    />
  );
};

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (state: any, ownProps: VideoPropsFromParent): Partial<VideoProps> => {
  state = autorunStateFromState(state);
  return {
    filePath: getAssetPath(state, ownProps.assetName),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): any => {
  return bindActionCreators({
    onVideoEnd: postVideoEnd,
    onSetVideoElementRef: setVideoElementRef,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoComponent);
