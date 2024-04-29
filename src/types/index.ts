import { browserImageTools } from "../tools/browserImageTools";

export interface UnknownObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export enum DotType {
  dots = "dots",
  randomDots = "random-dots",
  rounded = "rounded",
  verticalLines = "vertical-lines",
  horizontalLines = "horizontal-lines",
  classy = "classy",
  classyRounded = "classy-rounded",
  square = "square",
  smallSquare = "small-square",
  extraRounded = "extra-rounded",
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
export enum GradientType {
  radial = "radial",
  linear = "linear"
}
export enum ShapeType {
  square = "square",
  circle = "circle"
}

export type Gradient = {
  /**
   * Type of gradient spread
   *
   * @default GradientType.linear
   */
  type: GradientType;
  /**
   * Rotation of gradient (in radians, Math.PI === 180 degrees)
   *
   * @default 0
   */
  rotation?: number;
  /** Gradient colors. */
  colorStops: {
    /** Position of color in gradient range */
    offset: number;
    /** Color of stop in gradient range */
    color: string;
  }[];
};

type TypeNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40;

const TypeNumber = Array(41)
  .fill(0)
  .map((_, i) => i) as unknown as {
  [P in TypeNumber]: P;
};

export { TypeNumber };

export enum ErrorCorrectionLevel {
  L = "L",
  M = "M",
  Q = "Q",
  H = "H"
}

export enum Mode {
  numeric = "Numeric",
  alphanumeric = "Alphanumeric",
  byte = "Byte",
  kanji = "Kanji",
  unicode = "Unicode"
}

export interface QRCode {
  addData(data: string, mode?: Mode.alphanumeric | Mode.byte | Mode.kanji | Mode.numeric): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

export type Options = {
  /** Use a custom DOM domplementation */
  document?: Document;
  /** Use a custom image fetching & serializaton implementation */
  imageTools?: typeof browserImageTools;
  /** @ignore */
  width?: number;
  /** @ignore */
  height?: number;
  /** The data will be encoded in the QR code */
  data?: string;
  /** The image will be copied to the center of the QR code */
  image?: string | Buffer | Blob;
  /**
   * QR code shape
   *
   * @default ShapeType.square
   */
  shape?: ShapeType;
  /** Options will be passed to `qrcode-generator` lib */
  qrOptions?: {
    typeNumber?: TypeNumber;
    mode?: Mode;
    /** @default ErrorCorrectionLevel.Q */
    errorCorrectionLevel?: ErrorCorrectionLevel;
  };
  imageOptions?: {
    /**
     * Hide all dots covered by the image
     *
     * @default true
     */
    hideBackgroundDots?: boolean;
    /**
     * Coefficient of the image size
     *
     * @default 0.4
     */
    imageSize?: number;
    /**
     * Margin of the image (in blocks)
     *
     * @default 0
     */
    margin?: number;
    /**
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/crossOrigin)
     */
    crossOrigin?: string;
  };
  dotsOptions?: {
    /**
     * QR dot size (in pixels)
     *
     * @default 10
     */
    size?: number;
    /**
     * Color of QR dots
     *
     * @default "#000"
     */
    color?: string;
    /** Gradient of QR dots */
    gradient?: Gradient;
    /**
     * Style of QR dots
     *
     * @default DotType.square
     */
    type?: DotType;
  };
  /** Corners Square options, omitted values match dots */
  cornersSquareOptions?: {
    /** Color of Corners Square */
    color?: string;
    /** Gradient of Corners Square */
    gradient?: Gradient;
    /** Style of Corners Square */
    type?: CornerSquareType;
  };
  /** Corners Dot options, omitted values match squares */
  cornersDotOptions?: {
    /** Color of Corners Dot */
    color?: string;
    /** Gradient of Corners Dot */
    gradient?: Gradient;
    /** Style of Corners Dot */
    type?: CornerDotType;
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
};

export type CanvasOptions = {
  width?: number;
  height?: number;
  margin?: number;
};

export type FilterFunction = (i: number, j: number) => boolean;

export type DrawArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
  getNeighbor?: GetNeighbor;
};

export type BasicFigureDrawArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
};

export type RotateFigureArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
  draw: () => void;
};

export type GetNeighbor = (x: number, y: number) => boolean;

export type ExtensionFunction = (svg: SVGElement, options: Options) => void;

export enum FileExtension {
  svg = "svg",
  png = "png",
  jpeg = "jpeg",
  webp = "webp"
}
