import { v4 } from 'uuid';
import {
  Dimensions,
  ImageRenderProperties,
  Rectangle,
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
  imageDimensions: Dimensions): ImageRenderProperties => {

  switch (imageModeType) {
    // case ImageModeType.CenterImage:
    //   return getCenterImageRectangle(zoneDimensions, imageDimensions);
    // case ImageModeType.ScaleToFit:
    //   return getScaleToFitImageRectangle(zoneDimensions, imageDimensions);
    // case ImageModeType.ScaleToFill:
    //   return getScaleToFillImageRectangle(zoneDimensions, imageDimensions);
    // case ImageModeType.FillAndCrop:
    // default:
    //   return getScaleToFillAndCropImageRectangle(zoneDimensions, imageDimensions);
    default:
      return getCenterImageRenderProperties(zoneDimensions, imageDimensions);
  }
};

const getCenterImageRectangle = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): Rectangle => {

  if ((imageDimensions.width > zoneDimensions.width) || (imageDimensions.height > zoneDimensions.height)) {
    // image size is larger than zone size
    return {
      x: 0,
      y: 0,
      width: zoneDimensions.width,
      height: zoneDimensions.height,
    };
  } else {
    // image size is smaller than zone size
    const x = (zoneDimensions.width - imageDimensions.width) / 2;
    const y = (zoneDimensions.height - imageDimensions.height) / 2;
    return {
      x,
      y,
      width: imageDimensions.width,
      height: imageDimensions.height,
    };
  }
};

const getCenterImageRenderProperties = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): ImageRenderProperties => {

  if ((imageDimensions.width > zoneDimensions.width) || (imageDimensions.height > zoneDimensions.height)) {

    let left: number;
    let top: number;

    let widthOverflow = imageDimensions.width - zoneDimensions.width;
    if (widthOverflow < 0) {
      widthOverflow = 0;
      left = (zoneDimensions.width - imageDimensions.width) / 2;
    } else {
      left = -(widthOverflow / 4);
    }

    let heightOverflow = imageDimensions.height - zoneDimensions.height;
    if (heightOverflow < 0) {
      heightOverflow = 0;
      top = (zoneDimensions.height - imageDimensions.height) / 2;
    } else {
      top = -(heightOverflow / 4);
    }

    const insetTop = heightOverflow / 4;
    const insetRight = widthOverflow / 4;
    const insetBottom = insetTop;
    const insetLeft = insetRight;
    
    const imageRenderProperties: ImageRenderProperties = {
      position: {
        left,
        top,
      },
      // TODO - are the dimensions accurate if only one dimension of the image is larger than the zone?
      dimensions: {
        width: zoneDimensions.width,
        height: zoneDimensions.height,
      },
      inset: {
        top: insetTop,
        right: insetRight,
        bottom: insetBottom,
        left: insetLeft,
      }
    };
    return imageRenderProperties;

  } else {
    // image size is smaller than zone size
    const imageRenderProperties: ImageRenderProperties = {
      position: {
        left: (zoneDimensions.width - imageDimensions.width) / 2,
        top: (zoneDimensions.height - imageDimensions.height) / 2,
      },
      dimensions: {
        width: imageDimensions.width,
        height: imageDimensions.width,
      },
      inset: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }
    };
    return imageRenderProperties;
    // const x = (zoneDimensions.width - imageDimensions.width) / 2;
    // const y = (zoneDimensions.height - imageDimensions.height) / 2;
    // return {
    //   x,
    //   y,
    //   width: imageDimensions.width,
    //   height: imageDimensions.height,
    // };
  }
};


const getScaleToFitImageRectangle = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): Rectangle => {
  return {
    x: 0,
    y: 0,
    width: zoneDimensions.width,
    height: zoneDimensions.height,
  };
};

const getScaleToFillImageRectangle = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): Rectangle => {
  return {
    x: 0,
    y: 0,
    width: zoneDimensions.width,
    height: zoneDimensions.height,
  };
};

const getScaleToFillAndCropImageRectangle = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): Rectangle => {
  return {
    x: 0,
    y: 0,
    width: zoneDimensions.width,
    height: zoneDimensions.height,
  };
};
