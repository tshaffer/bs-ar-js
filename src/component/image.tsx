/* eslint-disable no-case-declarations */
import * as React from 'react';
import { isNil } from 'lodash';
import isomorphicPath from 'isomorphic-path';

import { connect } from 'react-redux';
import { getAssetPath } from '../selector';
import { AutorunState, autorunStateFromState, CanvasRenderProperties, Dimensions } from '../type';
import * as sizeOf from 'image-size';
import { getImageRenderProperties } from '../utility';
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

const ImageComponent = (props: any) => {

  const canvasRef = React.useRef(null);
  let ctx: CanvasRenderingContext2D | null = null;

  // const [canvasRef, setCanvasRef] = React.useState<React.RefObject<HTMLCanvasElement>>();
  // const [ctx, setCtx] = React.useState<CanvasRenderingContext2D>();
  // const [img, setImg] = React.useState<HTMLImageElement>();

  // React.useEffect(() => {
  //   console.log('useEffect invoked');
  //   setCanvasRef(React.createRef());
  //   if (!isNil(canvasRef) && !isNil(canvasRef.current)) {
  //     console.log('get ctx');
  //     setCtx((canvasRef.current as any).getContext('2d'));
  //     // this.forceUpdate();
  //     console.log(props.filePath);
  //   }
  //   // }, [canvasRef]);
  // }, []);

  // console.log('after useEffect invoked');

  const renderImg = (img: HTMLImageElement) => {

    const imageBitmapPromise: Promise<ImageBitmap> = createImageBitmap(img);

    imageBitmapPromise.then((imageBitmap: ImageBitmap) => {

      console.log('renderImg: createImageBitmap success: ');
      console.log(imageBitmap);

      const imageDimensions = sizeOf(props.filePath as string);
      if (isNil(imageDimensions)) {
        return null;
      }

      const canvasRenderProperties: CanvasRenderProperties = getImageRenderProperties(
        props.imageMode,
        {
          width: props.zoneWidth,
          height: props.zoneHeight
        },
        {
          width: imageDimensions.width,
          height: imageDimensions.height
        },
      );

      const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } = canvasRenderProperties;

      if (!isNil(ctx)) {
        ctx.clearRect(0, 0, props.zoneWidth, props.zoneHeight);
        ctx.drawImage(imageBitmap, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      }
      return;

    }).catch((reason: any) => {
      console.log('renderImg: createImageBitmap failed: ', reason);
    });
  };

  const src: string = isomorphicPath.join('file://', props.filePath);

  if (!isNil(canvasRef) && !isNil(canvasRef.current)) {

    console.log('render: canvas ref is good!');
    ctx = (canvasRef.current as any).getContext('2d');

    const img: HTMLImageElement = document.createElement('img');
    img.src = src;

    if (img.complete) {
      console.log('image already loaded');
      renderImg(img);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      img.addEventListener('load', function () { renderImg(img); });
      img.addEventListener('error', function () {
        alert('error');
      });
    }
  } else {
    console.log('render: canvas ref not set yet');
  }

  const dimensions = sizeOf(props.filePath as string);
  if (isNil(dimensions)) {
    return null;
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={props.zoneWidth.toString() + 'px'}
        height={props.zoneHeight.toString() + 'px'}
      >
      </canvas>
    </div>
  );
};


// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (state: AutorunState, ownProps: ImagePropsFromParent): any => {
  state = autorunStateFromState(state);
  return {
    filePath: getAssetPath(state, ownProps.assetName) as string,
  };
};

export default connect(mapStateToProps)(ImageComponent);
