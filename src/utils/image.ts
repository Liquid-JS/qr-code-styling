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

  if (
    originalHeight <= 0 ||
    originalWidth <= 0 ||
    maxHiddenDots <= 0 ||
    dotSize <= 0 ||
    4 * margin ** 2 > maxHiddenDots
  ) {
    return {
      height: 0,
      width: 0,
      hideYDots: 0,
      hideXDots: 0
    };
  }

  //If set, ensure maxHiddenAxisDots is odd and at least 1
  if (maxHiddenAxisDots && maxHiddenAxisDots % 2 == 0) maxHiddenAxisDots = Math.max(1, maxHiddenAxisDots - 1);

  //Determine the bigger and smaller image dimension
  const dimMax = Math.max(originalWidth, originalHeight);
  const dimMin = Math.min(originalWidth, originalHeight);

  //Find max image size along the bigger dimension
  let lower = 0,
    upper = (maxHiddenAxisDots || maxHiddenDots) - 2 * margin;
  do {
    const size = lower + (upper - lower) / 2;
    let dotsMax = Math.max(1, Math.ceil(size + 2 * margin));
    if (dotsMax % 2 == 0) dotsMax++;
    let dotsMin = Math.max(1, Math.ceil((size * dimMin) / dimMax + 2 * margin));
    if (dotsMin % 2 == 0) dotsMin++;

    if (dotsMax * dotsMin > maxHiddenDots) upper = size;
    else lower = size;
  } while (Math.abs(lower - upper) > 0.001);

  //Calculate how many dots the given size corresponds to
  const size = lower;
  let hideMax = Math.max(1, Math.ceil(size + 2 * margin));
  if (hideMax % 2 == 0) hideMax++;
  let hideMin = Math.max(1, Math.ceil((size * dimMin) / dimMax + 2 * margin));
  if (hideMin % 2 == 0) hideMin++;

  //Set hidden dots along bigger and smaller dimension to the right axis
  if (originalWidth > originalHeight) {
    hideDots.x = hideMax;
    hideDots.y = hideMin;
  } else {
    hideDots.x = hideMin;
    hideDots.y = hideMax;
  }

  //Fit image to the hidden dots
  const maxW = (hideDots.x - 2 * margin) * dotSize;
  const maxH = (hideDots.y - 2 * margin) * dotSize;
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
