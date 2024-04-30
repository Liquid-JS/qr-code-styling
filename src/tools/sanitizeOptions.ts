import { RequiredCanvasOptions, RequiredOptions } from "../core/QROptions.js";
import { Gradient } from "../types/index.js";

function sanitizeGradient(gradient: Gradient): Gradient {
  const newGradient = { ...gradient };

  if (!newGradient.colorStops || !newGradient.colorStops.length) {
    throw "Field 'colorStops' is required in gradient";
  }

  if (newGradient.rotation) {
    newGradient.rotation = Number(newGradient.rotation);
  } else {
    newGradient.rotation = 0;
  }

  newGradient.colorStops = newGradient.colorStops.map((colorStop: { offset: number; color: string }) => ({
    ...colorStop,
    offset: Number(colorStop.offset)
  }));

  return newGradient;
}

export function sanitizeOptions(options: RequiredOptions): RequiredOptions {
  const newOptions = { ...options };

  newOptions.imageOptions = {
    ...newOptions.imageOptions,
    hideBackgroundDots: Boolean(newOptions.imageOptions.hideBackgroundDots),
    imageSize: Math.min(1, Number(newOptions.imageOptions.imageSize)) || 1,
    margin: Number(newOptions.imageOptions.margin)
  };

  newOptions.dotsOptions = {
    ...newOptions.dotsOptions
  };
  if (newOptions.dotsOptions.gradient) {
    newOptions.dotsOptions.gradient = sanitizeGradient(newOptions.dotsOptions.gradient);
  }
  // Ensure integer dot size
  newOptions.dotsOptions.size = Math.round(Math.max(0, newOptions.dotsOptions.size) || 10);

  if (newOptions.cornersSquareOptions) {
    newOptions.cornersSquareOptions = {
      ...newOptions.cornersSquareOptions
    };
    if (newOptions.cornersSquareOptions.gradient) {
      newOptions.cornersSquareOptions.gradient = sanitizeGradient(newOptions.cornersSquareOptions.gradient);
    }
  }

  if (newOptions.cornersDotOptions) {
    newOptions.cornersDotOptions = {
      ...newOptions.cornersDotOptions
    };
    if (newOptions.cornersDotOptions.gradient) {
      newOptions.cornersDotOptions.gradient = sanitizeGradient(newOptions.cornersDotOptions.gradient);
    }
  }

  if (newOptions.backgroundOptions) {
    newOptions.backgroundOptions = {
      ...newOptions.backgroundOptions
    };
    if (newOptions.backgroundOptions.gradient) {
      newOptions.backgroundOptions.gradient = sanitizeGradient(newOptions.backgroundOptions.gradient);
    }
  }

  if (!newOptions.document) newOptions.document = document;

  return newOptions;
}

export function sanitizeCanvasOptions(options: RequiredCanvasOptions): RequiredCanvasOptions {
  const newOptions = { ...options };

  newOptions.width = Number(newOptions.width);
  newOptions.height = Number(newOptions.height);
  newOptions.margin = Number(newOptions.margin);

  if (newOptions.margin > Math.min(newOptions.width, newOptions.height)) {
    newOptions.margin = Math.min(newOptions.width, newOptions.height);
  }

  return newOptions;
}
