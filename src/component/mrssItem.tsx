import * as React from 'react';
import { isNil } from 'lodash';
import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getMrssItemFilePath } from '../selector';
import { AutorunState, autorunStateFromState } from '../type';
import * as sizeOf from 'image-size';
import { calculateAspectRatioFit } from '../utility';
import { Dimensions } from '../type';
// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface MrssPropsFromParent {
  mediaStateId: string;
  assetName: string;
  zoneWidth: number;
  zoneHeight: number;
  screenDimensions: Dimensions;
}

export interface MrssProps extends MrssPropsFromParent {
  filePath: string;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

export class MrssComponent extends React.Component<MrssProps> {

  render() {

    const src: string = isomorphicPath.join('file://', this.props.filePath);

    // console.log(this.props.filePath);

    const dimensions = sizeOf(this.props.filePath);
    if (isNil(dimensions)) {
      return null;
    }

    const scaledDimensions = calculateAspectRatioFit(
      dimensions.width,
      dimensions.height,
      this.props.zoneWidth,
      this.props.zoneHeight);

    const left = (this.props.screenDimensions.width - scaledDimensions.width) / 2;
    const top = (this.props.screenDimensions.height - scaledDimensions.height) / 2;

    return (
      <img
        style={{
          position: 'absolute',
          left,
          top,
        }}
        src={src}
        width={scaledDimensions.width.toString()}
        height={scaledDimensions.height.toString()}
      />
    );
  }
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (state: AutorunState, ownProps: MrssPropsFromParent): Partial<MrssProps> => {
  state = autorunStateFromState(state);
  return {
    filePath: getMrssItemFilePath(state, ownProps.mediaStateId),
    zoneWidth: ownProps.zoneWidth,
    zoneHeight: ownProps.zoneHeight,
    assetName: ownProps.assetName,
  };
};

export const Mrss = connect(mapStateToProps)(MrssComponent);
