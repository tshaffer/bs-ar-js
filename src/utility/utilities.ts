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
    case ImageModeType.CenterImage:
      return getCenterImageRenderProperties(zoneDimensions, imageDimensions);
    // case ImageModeType.ScaleToFit:
    //   return getScaleToFitImageRectangle(zoneDimensions, imageDimensions);
    case ImageModeType.ScaleToFill:
      return getScaleToFillRenderProperties(zoneDimensions);
    // case ImageModeType.FillAndCrop:
    // default:
    //   return getScaleToFillAndCropImageRectangle(zoneDimensions, imageDimensions);
    default:
      return getCenterImageRenderProperties(zoneDimensions, imageDimensions);
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
      dimensions: {
        width: zoneDimensions.width - left,
        height: zoneDimensions.height - top,
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
  }
};

const getScaleToFillRenderProperties = (
  zoneDimensions: Dimensions): ImageRenderProperties => {

  const imageRenderProperties: ImageRenderProperties = {
    position: {
      left: 0,
      top: 0,
    },
    dimensions: {
      width: zoneDimensions.width,
      height: zoneDimensions.height,
    },
    inset: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }
  };
  return imageRenderProperties;
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
