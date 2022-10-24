import { v4 } from 'uuid';
import {
  Dimensions,
  ImageRenderProperties,
  Rectangle,
} from '../type';

import { ImageModeType } from '@brightsign/bscore';
import _ from 'lodash';

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
    case ImageModeType.ScaleToFit:
      return getScaleToFitRenderProperties(zoneDimensions, imageDimensions);
    case ImageModeType.ScaleToFill:
      return getScaleToFillRenderProperties(zoneDimensions);
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

/*
  Scale to Fill:
    Scales the image to fill the zone without maintaining the aspect ratio.
*/
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

/*
  Scale to Fit: 
    Scales the image to fit the zone. 
    The image is displayed as large as possible while keeping the correct aspect ratio
*/
const getScaleToFitRenderProperties = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): ImageRenderProperties => {

  const xScale = imageDimensions.width / zoneDimensions.width;
  const yScale = imageDimensions.height / zoneDimensions.height;

  let x, y, width, height: number;

  if (xScale > yScale) {
    x = 0;
    y = (zoneDimensions.height - (imageDimensions.height / xScale)) / 2;
    width = imageDimensions.width / xScale;
    height = imageDimensions.height / xScale;
  } else {
    x = (zoneDimensions.width - (imageDimensions.width / yScale)) / 2;
    y = 0;
    width = imageDimensions.width / yScale;
    height = imageDimensions.height / yScale;
  }

  const imageRenderProperties: ImageRenderProperties = {
    position: {
      left: x,
      top: y,
    },
    dimensions: {
      width,
      height,
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

/*
  Scale to Fill and Crop: 
    Scales the image to completely fill the zone while maintaining the aspect ratio.
*/
const getScaleToFillAndCropRenderProperties = (
  zoneDimensions: Dimensions,
  imageDimensions: Dimensions): ImageRenderProperties => {

  const xScale = imageDimensions.width / zoneDimensions.width;
  const yScale = imageDimensions.height / zoneDimensions.height;

  let x, y, width, height: number;

  if (xScale < yScale) {
    x = 0;
    y = (zoneDimensions.height - (imageDimensions.height / xScale)) / 2;
    width = imageDimensions.width / xScale;
    height = imageDimensions.height / xScale;
  } else {
    x = (zoneDimensions.width - (imageDimensions.width / yScale)) / 2;
    y = 0;
    width = imageDimensions.width / yScale;
    height = imageDimensions.height / yScale;
  }

  let left: number;
  let top: number;

  let widthOverflow = width - zoneDimensions.width;
  if (widthOverflow < 0) {
    widthOverflow = 0;
    left = (zoneDimensions.width - imageDimensions.width) / 2;
  } else {
    left = -(widthOverflow / 4);
  }

  let heightOverflow = height - zoneDimensions.height;
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
  console.log('zoneDimensions: ', zoneDimensions);
  console.log('imageDimensions: ', imageDimensions);
  console.log('xScale: ', xScale);
  console.log('yScale: ', yScale);
  console.log('x: ', x);
  console.log('y: ', y);
  console.log('widthOverflow: ', widthOverflow);
  console.log('heightOverflow: ', heightOverflow);
  console.log('width: ', width);
  console.log('height: ', height);
  
  console.log(imageRenderProperties);
  return imageRenderProperties;

};
