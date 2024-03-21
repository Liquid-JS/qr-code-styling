interface ImageSizeOptions {
  originalHeight: number;
  originalWidth: number;
  maxHiddenDots: number;
  maxHiddenAxisDots?: number;
  dotSize: number;
  margin: number;
}

interface ImageSizeResult {
  height: number;
  width: number;
  hideYDots: number;
  hideXDots: number;
}

export function calculateImageSize({
  originalHeight,
  originalWidth,
  maxHiddenDots,
  maxHiddenAxisDots,
  dotSize,
  margin
}: ImageSizeOptions): ImageSizeResult {
  const hideDots = { x: 0, y: 0 };
  const imageSize = { x: 0, y: 0 };

  if (originalHeight <= 0 || originalWidth <= 0 || maxHiddenDots <= 0 || dotSize <= 0) {
    return {
      height: 0,
      width: 0,
      hideYDots: 0,
      hideXDots: 0
    };
  }

  if (maxHiddenAxisDots) {
    // Adjust max size based on image aspect ratio and margin
    const maxD = maxHiddenAxisDots - 2 * margin;
    if (originalWidth > originalHeight) {
      const newH = (maxD * originalHeight) / originalWidth + 2 * margin;
      maxHiddenDots = Math.min(maxHiddenDots, maxHiddenAxisDots * newH);
    } else {
      const newW = (maxD * originalWidth) / originalHeight + 2 * margin;
      maxHiddenDots = Math.min(maxHiddenDots, maxHiddenAxisDots * newW);
    }
  }

  const m2 = margin ** 2;
  const w2 = originalWidth ** 2;
  const h2 = originalHeight ** 2;

  //Margin-adjuseted scale
  const scale =
    (Math.sqrt(w2 * m2 + h2 * m2 + originalWidth * originalHeight * (maxHiddenDots - 2 * m2)) -
      originalHeight * margin -
      originalWidth * margin) /
    (originalHeight * originalWidth);

  hideDots.x = Math.max(1, Math.floor(originalWidth * scale + 2 * margin));
  hideDots.y = Math.max(1, Math.floor(originalHeight * scale + 2 * margin));

  if (hideDots.x > hideDots.y) {
    //The count of dots should be odd
    if (hideDots.x % 2 === 0) hideDots.x--;

    hideDots.y = Math.max(1, Math.ceil(((hideDots.x - 2 * margin) * originalHeight) / originalWidth + 2 * margin));

    //The count of dots should be odd
    if (hideDots.y % 2 === 0) hideDots.y--;
  } else if (hideDots.x < hideDots.y) {
    //The count of dots should be odd
    if (hideDots.y % 2 === 0) hideDots.y--;

    hideDots.x = Math.max(1, Math.ceil(((hideDots.y - 2 * margin) * originalWidth) / originalHeight + 2 * margin));

    //The count of dots should be odd
    if (hideDots.x % 2 === 0) hideDots.x--;
  }

  const maxW = (hideDots.x - 2 * margin) * dotSize;
  const maxH = (hideDots.y - 2 * margin) * dotSize;

  if (maxW <= 0 || maxH <= 0) {
    return {
      height: 0,
      width: 0,
      hideYDots: hideDots.y,
      hideXDots: hideDots.x
    };
  }

  imageSize.x = maxW;
  imageSize.y = (maxW * originalHeight) / originalWidth;
  if (imageSize.y > maxH) {
    imageSize.y = maxH;
    imageSize.x = (maxH * originalWidth) / originalHeight;
  }

  return {
    height: Math.round(imageSize.y + 2 * margin * dotSize),
    width: Math.round(imageSize.x + 2 * margin * dotSize),
    hideYDots: hideDots.y,
    hideXDots: hideDots.x
  };
}
