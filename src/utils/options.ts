import { browserImageTools } from "../tools/browser-image-tools.js";
import { ErrorCorrectionLevel, TypeNumber } from "../types/qrcode.js";
import { Gradient, sanitizeGradient } from "./gradient.js";

export enum DotType {
  dot = "dot",
  randomDot = "random-dot",
  rounded = "rounded",
  extraRounded = "extra-rounded",
  verticalLine = "vertical-line",
  horizontalLine = "horizontal-line",
  classy = "classy",
  classyRounded = "classy-rounded",
  square = "square",
  smallSquare = "small-square",
  diamond = "diamond"
}

export enum CornerDotType {
  dot = "dot",
  square = "square",
  heart = "heart",
  extraRounded = "extra-rounded",
  classy = "classy",
  outpoint = "outpoint",
  inpoint = "inpoint"
}

export enum CornerSquareType {
  dot = "dot",
  square = "square",
  extraRounded = "extra-rounded",
  classy = "classy",
  outpoint = "outpoint",
  inpoint = "inpoint"
}

export enum ShapeType {
  square = "square",
  circle = "circle"
}

export interface Options {
  /** Use a custom DOM domplementation */
  document: Document;
  /** Use a custom image fetching & serializaton implementation */
  imageTools?: typeof browserImageTools;
  /** @ignore */
  width: number;
  /** @ignore */
  height: number;
  /** The data will be encoded in the QR code */
  data: string;
  /** The image will be copied to the center of the QR code */
  image?: string | Buffer | Blob;
  /**
   * QR code shape
   *
   * @default ShapeType.square
   */
  shape: `${ShapeType}`;
  /** Options will be passed to `qrcode-generator` lib */
  qrOptions: {
    typeNumber: TypeNumber;
    mode?: `${Mode}`;
    /** @default ErrorCorrectionLevel.Q */
    errorCorrectionLevel: `${ErrorCorrectionLevel}`;
  };
  imageOptions: {
    /**
     * Hide all dots covered by the image
     *
     * @default true
     */
    hideBackgroundDots: boolean;
    /**
     * Coefficient of the image size
     *
     * @default 0.4
     */
    imageSize: number;
    /**
     * Margin of the image (in blocks)
     *
     * @default 0
     */
    margin: number;
    /**
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/crossOrigin)
     */
    crossOrigin?: string;
  };
  dotsOptions: {
    /**
     * QR dot size (in pixels)
     *
     * @default 10
     */
    size: number;
    /**
     * Color of QR dots
     *
     * @default "#000"
     */
    color: string;
    /** Gradient of QR dots */
    gradient?: Gradient;
    /**
     * Style of QR dots
     *
     * @default DotType.square
     */
    type: `${DotType}`;
  };
  /** Corners Square options, omitted values match dots */
  cornersSquareOptions?: {
    /** Color of Corners Square */
    color?: string;
    /** Gradient of Corners Square */
    gradient?: Gradient;
    /** Style of Corners Square */
    type?: `${CornerSquareType}`;
  };
  /** Corners Dot options, omitted values match squares */
  cornersDotOptions?: {
    /** Color of Corners Dot */
    color?: string;
    /** Gradient of Corners Dot */
    gradient?: Gradient;
    /** Style of Corners Dot */
    type?: `${CornerDotType}`;
  };
  /** QR background styling options, false to disable background */
  backgroundOptions?:
    | {
        /** Background roundnes, from 0 (square) to 1 (circle) */
        round?: number;
        /** Background color */
        color?: string;
        /** Background Gradient */
        gradient?: Gradient;
        /**
         * Margin (in blocks) between background and the QR code
         *
         * @default 0
         */
        margin?: number;
      }
    | false;
  /** `import { stringToBytesFuncs } from "@liquid-js/qr-code-styling/kanji";` to add Kanji support */
  stringToBytesFuncs?: { [encoding: string]: (s: string) => number[] };
}

export const defaultOptions: Options = {
  document: undefined as never,
  shape: ShapeType.square,
  width: undefined as never,
  height: undefined as never,
  data: "",
  qrOptions: {
    typeNumber: TypeNumber[0],
    mode: undefined,
    errorCorrectionLevel: ErrorCorrectionLevel.Q
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.4,
    crossOrigin: undefined,
    margin: 0
  },
  dotsOptions: {
    type: DotType.square,
    color: "#000",
    size: 10
  }
};

export function sanitizeOptions(options: Options): Options {
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
