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

  let sx = 0;
  let sWidth = 0;
  let dx = 0;
  let dWidth = 0;

  let sy = 0;
  let sHeight = 0;
  let dy = 0;
  let dHeight = 0;

  const imageWidthOverflow = imageDimensions.width - zoneDimensions.width;
  if (imageWidthOverflow > 0) {
    // will zoom in on image - show the center of the image
    sx = imageWidthOverflow / 2;
    sWidth = zoneDimensions.width;
    dx = 0;
    dWidth = zoneDimensions.width;
  } else {
    // will display entire image, centered within the zone
    sx = 0;
    sWidth = imageDimensions.width;
    dx = (zoneDimensions.width - imageDimensions.width) / 2;
    dWidth = imageDimensions.width;
  }
  const imageHeightOverflow = imageDimensions.height - zoneDimensions.height;
  if (imageHeightOverflow > 0) {
    // will zoom in on image - show the center of the image
    sy = imageHeightOverflow / 2;
    sHeight = zoneDimensions.height;
    dy = 0;
    dHeight = zoneDimensions.height;
  } else {
    // will display entire image, centered within the zone
    sy = 0;
    sHeight = imageDimensions.height;
    dy = (zoneDimensions.height - imageDimensions.height) / 2;
    dHeight = imageDimensions.height;
  }

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

  const zoneAspectRatio = zoneDimensions.width / zoneDimensions.height;
  const imageAspectRatio = imageDimensions.width / imageDimensions.height;

  let sourceX, sourceY, sourceWidth, sourceHeight: number;

  if (imageAspectRatio < zoneAspectRatio) {
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
