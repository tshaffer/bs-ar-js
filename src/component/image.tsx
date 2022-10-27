import * as React from 'react';
import { isNil } from 'lodash';
import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getAssetPath } from '../selector';
import { AutorunState, autorunStateFromState, Dimensions, ImageRenderProperties, Rectangle } from '../type';
import * as sizeOf from 'image-size';
import { calculateAspectRatioFit, getImageRenderProperties } from '../utility';
import { ImageModeType } from '@brightsign/bscore';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface ImagePropsFromParent {
  assetName: string;
  zoneWidth: number;
  zoneHeight: number;
  screenDimensions: Dimensions;
  imageMode: ImageModeType;
}

export interface ImageProps extends ImagePropsFromParent {
  filePath: string;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

export class ImageComponent extends React.Component<ImageProps> {

  canvas: React.RefObject<HTMLCanvasElement>;
  img: HTMLImageElement;

  constructor(props: ImageProps) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidMount() {
    if (!isNil(this.canvas) && !isNil(this.canvas.current)) {
      const ctx = (this.canvas.current as any).getContext('2d');
      ctx.fillStyle = 'green';
      ctx.fillRect(10, 10, 100, 100);
    }
  }

  loaded() {
    console.log('loaded() invoked');
    const imageBitmapPromise: Promise<ImageBitmap> = createImageBitmap(this as unknown as HTMLImageElement);
    imageBitmapPromise.then((imageBitmap: ImageBitmap) => {
      console.log('createImageBitmap success: ');
      console.log(imageBitmap);
    }).catch((reason: any) => {
      console.log('createImageBitmap failed: ', reason);
    });
  }
  
  render() {

    const src: string = isomorphicPath.join('file://', this.props.filePath);

    if (!isNil(this.canvas) && !isNil(this.canvas.current)) {
      console.log('render: canvas ref is good!');

      const img: HTMLImageElement = document.createElement('img');
      img.src = src;

      if (img.complete) {
        console.log('image already loaded');
        this.loaded();
      } else {
        img.addEventListener('load', this.loaded);
        img.addEventListener('error', function () {
          alert('error');
        });
      }
    }

    const dimensions = sizeOf(this.props.filePath as string);
    if (isNil(dimensions)) {
      return null;
    }

    const imageRenderProperties: ImageRenderProperties = getImageRenderProperties(
      this.props.imageMode,
      {
        width: this.props.zoneWidth,
        height: this.props.zoneHeight,
      },
      {
        width: dimensions.width,
        height: dimensions.height,
      },
    );

    const { top, right, bottom, left } = imageRenderProperties.inset;
    let clipPath: string = 'inset(' + top.toString() + 'px ';
    clipPath = clipPath + right.toString() + 'px ';
    clipPath = clipPath + bottom.toString() + 'px ';
    clipPath = clipPath + left.toString() + 'px)';

    /*
    return (
      <img
        style={{
          position: 'absolute',
          left: imageRenderProperties.position.left.toString() + 'px',
          top: imageRenderProperties.position.top.toString() + 'px',
          clipPath,
        }}
        src={src}
        width={imageRenderProperties.dimensions.width.toString() + 'px'}
        height={imageRenderProperties.dimensions.height.toString() + 'px'}
        alt=''
      />
    );
    */

    // const canvas = document.querySelector('canvas');
    // const ctx = canvas.getContext('2d');
    // ctx.fillStyle = 'green';
    // ctx.fillRect(10, 10, 100, 100);

    return (
      <div>
        <canvas
          ref={this.canvas}
          width="300"
          height="300"
        >
        </canvas>
      </div>
    )

  }
}

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (state: AutorunState, ownProps: ImagePropsFromParent): any => {
  state = autorunStateFromState(state);
  return {
    filePath: getAssetPath(state, ownProps.assetName) as string,
  };
};

export const Image = connect(mapStateToProps)(ImageComponent);
