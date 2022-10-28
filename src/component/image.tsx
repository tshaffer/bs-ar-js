/* eslint-disable no-case-declarations */
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
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement;

  constructor(props: ImageProps) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidMount() {
    console.log('componentDidMount invoked');
    if (!isNil(this.canvas) && !isNil(this.canvas.current)) {
      console.log('get ctx');
      this.ctx = (this.canvas.current as any).getContext('2d');
    }
  }

  renderImg(img: HTMLImageElement) {
    const imageBitmapPromise: Promise<ImageBitmap> = createImageBitmap(img);
    imageBitmapPromise.then((imageBitmap: ImageBitmap) => {

      console.log('renderImg: createImageBitmap success: ');
      console.log(imageBitmap);

      const imageDimensions = sizeOf(this.props.filePath as string);
      if (isNil(imageDimensions)) {
        return null;
      }

      // const imageRenderProperties: ImageRenderProperties = getImageRenderProperties(
      //   this.props.imageMode,
      //   {
      //     width: this.props.zoneWidth,
      //     height: this.props.zoneHeight,
      //   },
      //   {
      //     width: imageDimensions.width,
      //     height: imageDimensions.height,
      //   },
      // );

      const imageModeType = ImageModeType.FillAndCrop;

      switch (imageModeType) {

        /*
          Scale to Fill:
          Scales the image to fill the zone without maintaining the aspect ratio.
        */
        // case ImageModeType.ScaleToFill:
        //   const sx = 0;
        //   const sy = 0;
        //   const sWidth = imageDimensions.width;
        //   const sHeight = imageDimensions.height;
        //   const dx = 0;
        //   const dy = 0;
        //   const dWidth = this.props.zoneWidth;
        //   const dHeight = this.props.zoneHeight;

        //   this.ctx.drawImage(imageBitmap, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        //   return;

        /*
          Center Image: 
            Centers the image without scaling. This may result in cropping if the image is too large.
        */
        // case ImageModeType.CenterImage:

        //   let sx = 0;
        //   let sWidth = 0;
        //   let dx = 0;
        //   let dWidth = 0;

        //   let sy = 0;
        //   let sHeight = 0;
        //   let dy = 0;
        //   let dHeight = 0;

        //   const imageWidthOverflow = imageDimensions.width - this.props.zoneWidth;
        //   if (imageWidthOverflow > 0) {
        //     // will zoom in on image - show the center of the image
        //     sx = imageWidthOverflow / 2;
        //     sWidth = this.props.zoneWidth;
        //     dx = 0;
        //     dWidth = this.props.zoneWidth;
        //   } else {
        //     // will display entire image, centered within the zone
        //     sx = 0;
        //     sWidth = imageDimensions.width;
        //     dx = (this.props.zoneWidth - imageDimensions.width) / 2;
        //     dWidth = imageDimensions.width;
        //   }
        //   const imageHeightOverflow = imageDimensions.height - this.props.zoneHeight;
        //   if (imageHeightOverflow > 0) {
        //     // will zoom in on image - show the center of the image
        //     sy = imageHeightOverflow / 2;
        //     sHeight = this.props.zoneHeight;
        //     dy = 0;
        //     dHeight = this.props.zoneHeight;
        //   } else {
        //     // will display entire image, centered within the zone
        //     sy = 0;
        //     sHeight = imageDimensions.height;
        //     dy = (this.props.zoneHeight - imageDimensions.height) / 2;
        //     dHeight = imageDimensions.height;
        //   }
        //   this.ctx.drawImage(imageBitmap, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        //   return;

        /*
          Scale to Fit: 
            Scales the image to fit the zone. 
            The image is displayed as large as possible while keeping the correct aspect ratio
        */
        // case ImageModeType.ScaleToFit:

        //   const xScale = imageDimensions.width / this.props.zoneWidth;
        //   const yScale = imageDimensions.height / this.props.zoneHeight;

        //   let x, y, width, height: number;

        //   if (xScale > yScale) {

        //     // example data for the case where the image is larger than the zone
        //     //    zoneWidth = 400
        //     //    zoneHeight = 300
        //     //    imageWidth = 1600
        //     //    imageHeight = 600
        //     //    xScale = 4
        //     //    yScale = 2

        //     x = 0;
        //     y = (this.props.zoneHeight - (imageDimensions.height / xScale)) / 2;
        //     width = imageDimensions.width / xScale;
        //     height = imageDimensions.height / xScale;
        //   } else {
        //     // example data for the case where the zone is larger than the image
        //     //    imageWidth = 400
        //     //    imageHeight = 300
        //     //    zoneWidth = 1600
        //     //    zoneHeight = 600
        //     //    xScale = .25
        //     //    yScale = .5


        //     x = (this.props.zoneWidth - (imageDimensions.width / yScale)) / 2; // 400
        //     y = 0;
        //     width = imageDimensions.width / yScale; // 800
        //     height = imageDimensions.height / yScale; // 600
        //   }

        //   const sx = 0;
        //   const sy = 0;
        //   const sWidth = imageDimensions.width;
        //   const sHeight = imageDimensions.height;
        //   const dx = x;
        //   const dy = y;
        //   const dWidth = width;
        //   const dHeight = height;

        //   this.ctx.drawImage(imageBitmap, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        //   return;

        /*
          Scale to Fill and Crop: 
            Scales the image to completely fill the zone while maintaining the aspect ratio.
        */
        case ImageModeType.FillAndCrop:

          //   // example data
          //   //    zoneWidth = 400
          //   //    zoneHeight = 300
          //   //    imageWidth = 420
          //   //    imageHeight = 420
          //   //    xScale = 1.05
          //   //    yScale = 1.4
          //   // correct answers
          //   //    scale down by 1.05 => 400
          //   //    all 400 horizontal pixels are displayed
          //   //    300 of 400 vertical pixels are displayed
          //   //    sourceX = 0; sourceWidth = 420
          //   //    420 / 400 = 1.05
          //   //    sourceHeight = 1.05 * 300 = 315
          //   //    sourceY = (420 - 315) / 2 = 52.5

          // const xScale = imageDimensions.width / this.props.zoneWidth;
          // const yScale = imageDimensions.height / this.props.zoneHeight;
          // const sx = 0;
          // const sy = 52.5;
          // const sWidth = 420;
          // const sHeight = 315;
          // const dx = 0;
          // const dy = 0;
          // const dWidth = this.props.zoneWidth;
          // const dHeight = this.props.zoneHeight;

          const zoneAspectRatio = this.props.zoneWidth / this.props.zoneHeight;
          const imageAspectRatio = imageDimensions.width / imageDimensions.height;

          const xScale = imageDimensions.width / this.props.zoneWidth;
          const yScale = imageDimensions.height / this.props.zoneHeight;

          let sourceX, sourceY, sourceWidth, sourceHeight: number;


          if (imageAspectRatio > zoneAspectRatio) {
            // shrink vertically, use yScale
            // sourceWidth = imageDimensions.width / this.props.zoneWidth;
            // sourceHeight = imageDimensions.height;
            // sourceX = (this.props.zoneWidth - imageDimensions.width) / 2;
            // sourceY = 0;

            sourceWidth = imageDimensions.height * this.props.zoneWidth / this.props.zoneHeight;
            sourceHeight = imageDimensions.height;
            sourceX = (imageDimensions.width - sourceWidth) / 2;
            sourceY = 0;
          } else {
            // shrink horizontally, use xScale
            //    notes
            //      image: 896 x 1080
            //      zone: 400 x 300
            //      shrinkage factor: 2.24
            //      sourceWidth = 896
            //      how much of the original image (in the y dimension) to display in the 300 vertical pixels?
            //      I'm displaying 896 (all in the x dimension) in the 400 horizontal dimension
            //      896 is to 400 as sourceHeight is to 300
            //      896 / 400 = sourceHeight / 300
            //      896 * 300 / 400 = 672
            //      sourceHeight = 672
            //      sourceY = (imageHeight - sourceHeight) / 2
            //      in code
            //        sourceHeight = imageDimensions.width * zoneHeight / zoneWidth
            //        sourceY = (imageHeight - sourceHeight) / 2
            sourceWidth = imageDimensions.width;
            sourceHeight = imageDimensions.width * this.props.zoneHeight / this.props.zoneWidth;
            sourceX = 0;
            sourceY = (imageDimensions.height - sourceHeight) / 2;
          }



          //   // example data
          //   //    zoneWidth = 400
          //   //    zoneHeight = 300
          //   //    imageWidth = 1600
          //   //    imageHeight = 600
          //   //    xScale = 4
          //   //    yScale = 2

          //   // in this example data, scale down by yScale
          //   //      horizontally, show 600 - 1000 of the source across 400 pixels on the destination
          //   //      vertically, show 150 - 450 of the source across 300 pixels on the destination

          //   //    destinationX = 0
          //   //    destinationY = 0
          //   //    destinationWidth = zoneWidth = 400
          //   //    destinationHeight = zoneHeight = 300
          //   //    sourceX = 400
          //   //    sourceY = 0
          //   //    sourceWidth = 800
          //   //    sourceHeight = 600
          //   sourceX = 0;
          //   sourceY = 0;
          //   //   // y = (this.props.zoneHeight - (imageDimensions.height / xScale)) / 2;
          //   sourceWidth = imageDimensions.width / yScale;
          //   sourceHeight = imageDimensions.height / yScale;
          // } else {
          //   // x = (this.props.zoneWidth - (imageDimensions.width / yScale)) / 2;
          //   sourceX = 0;
          //   sourceY = 0;
          //   sourceWidth = imageDimensions.width / xScale;
          //   sourceHeight = imageDimensions.height / xScale;
          // }

          const sx = sourceX;
          const sy = sourceY;
          const sWidth = sourceWidth;
          const sHeight = sourceHeight;
          const dx = 0;
          const dy = 0;
          const dWidth = this.props.zoneWidth;
          const dHeight = this.props.zoneHeight;

          this.ctx.drawImage(imageBitmap, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
          return;

        default:
          return;
      }

      /*
        Scale to Fill:
          Scales the image to fill the zone without maintaining the aspect ratio.
      */
      // const sx = 0;
      // const sy = 0;
      // const sWidth = imageDimensions.width;
      // const sHeight = imageDimensions.height;
      // const dx = 0;
      // const dy = 0;
      // const dWidth = this.props.zoneWidth;
      // const dHeight = this.props.zoneHeight;

      // this.ctx.drawImage(imageBitmap, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    }).catch((reason: any) => {
      console.log('renderImg: createImageBitmap failed: ', reason);
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
        this.renderImg(img);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        img.addEventListener('load', function () { self.renderImg(img); });
        img.addEventListener('error', function () {
          alert('error');
        });
      }
    } else {
      console.log('render: canvas ref not set yet');
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

    /*
          width={imageRenderProperties.dimensions.width.toString() + 'px'}
          height={imageRenderProperties.dimensions.height.toString() + 'px'}
    */
    return (
      <div>
        <canvas
          ref={this.canvas}
          width={this.props.zoneWidth.toString() + 'px'}
          height={this.props.zoneHeight.toString() + 'px'}
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
