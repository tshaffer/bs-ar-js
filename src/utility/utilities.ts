import { v4 } from 'uuid';
import {
  CanvasRenderProperties,
  Dimensions,
} from '../type';

import { ImageModeType } from '@brightsign/bscore';

export const newAutorunId = () => v4();

export const calculateAspectRatioFit = (
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number): Dimensions => {

  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio
  };
};

export const getImageRenderProperties = (
  imageModeType: ImageModeType,
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): CanvasRenderProperties => {

  switch (imageModeType) {
    case ImageModeType.CenterImage:
      return getCenterImageRenderProperties(zoneDimensions, imageDimensions);
    case ImageModeType.ScaleToFit:
      return getScaleToFitRenderProperties(zoneDimensions, imageDimensions);
    case ImageModeType.ScaleToFill:
      return getScaleToFillRenderProperties(zoneDimensions, imageDimensions);
    case ImageModeType.FillAndCrop:
    default:
      return getScaleToFillAndCropRenderProperties(zoneDimensions, imageDimensions);
  }
};

/*
  Center Image: 
    Centers the image without scaling. This may result in cropping if the image is too large.
*/
const getCenterImageRenderProperties = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): CanvasRenderProperties => {

  // TEMPORARY
  const canvasRenderProperties: CanvasRenderProperties = {
    sx: 0,
    sy: 0,
    sWidth: imageDimensions.width,
    sHeight: imageDimensions.height,
    dx: 0,
    dy: 0,
    dWidth: zoneDimensions.width,
    dHeight: zoneDimensions.height,
  };
  return canvasRenderProperties;

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


};

/*
  Scale to Fill:
    Scales the image to fill the zone without maintaining the aspect ratio.
*/
const getScaleToFillRenderProperties = (
  imageDimensions: Dimensions,
  zoneDimensions: Dimensions
): CanvasRenderProperties => {

  const canvasRenderProperties: CanvasRenderProperties = {
    sx: 0,
    sy: 0,
    sWidth: imageDimensions.width,
    sHeight: imageDimensions.height,
    dx: 0,
    dy: 0,
    dWidth: zoneDimensions.width,
    dHeight: zoneDimensions.height,
  };
  return canvasRenderProperties;
};

/*
  Scale to Fit: 
    Scales the image to fit the zone. 
    The image is displayed as large as possible while keeping the correct aspect ratio
*/
const getScaleToFitRenderProperties = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): CanvasRenderProperties => {

  // TEMPORARY
  const canvasRenderProperties: CanvasRenderProperties = {
    sx: 0,
    sy: 0,
    sWidth: imageDimensions.width,
    sHeight: imageDimensions.height,
    dx: 0,
    dy: 0,
    dWidth: zoneDimensions.width,
    dHeight: zoneDimensions.height,
  };
  return canvasRenderProperties;

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

};

/*
  Scale to Fill and Crop: 
    Scales the image to completely fill the zone while maintaining the aspect ratio.
*/
const getScaleToFillAndCropRenderProperties = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): CanvasRenderProperties => {

  const zoneAspectRatio = zoneDimensions.width / zoneDimensions.height;
  const imageAspectRatio = imageDimensions.width / imageDimensions.height;

  let sourceX, sourceY, sourceWidth, sourceHeight: number;

  if (imageAspectRatio > zoneAspectRatio) {
    sourceWidth = imageDimensions.height * zoneDimensions.width / zoneDimensions.height;
    sourceHeight = imageDimensions.height;
    sourceX = (imageDimensions.width - sourceWidth) / 2;
    sourceY = 0;
  } else {
    sourceWidth = imageDimensions.width;
    sourceHeight = imageDimensions.width * zoneDimensions.height / zoneDimensions.width;
    sourceX = 0;
    sourceY = (imageDimensions.height - sourceHeight) / 2;
  }

  const canvasRenderProperties: CanvasRenderProperties = {
    sx: sourceX,
    sy: sourceY,
    sWidth: sourceWidth,
    sHeight: sourceHeight,
    dx: 0,
    dy: 0,
    dWidth: zoneDimensions.width,
    dHeight: zoneDimensions.height,
  };

  return canvasRenderProperties;
};
