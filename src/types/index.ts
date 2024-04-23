import { browserImageTools } from "../tools/browserImageTools";

export interface UnknownObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export enum DotType {
  dots = "dots",
  rounded = "rounded",
  classy = "classy",
  classyRounded = "classy-rounded",
  square = "square",
  extraRounded = "extra-rounded"
}
export enum CornerDotType {
  dot = "dot",
  square = "square"
}
export enum CornerSquareType {
  dot = "dot",
  square = "square",
  extraRounded = "extra-rounded"
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
  type: GradientType;
  rotation?: number;
  colorStops: {
    offset: number;
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
  kanji = "Kanji"
}
export interface QRCode {
  addData(data: string, mode?: Mode): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

export type Options = {
  document?: Document;
  shape?: ShapeType;
  width?: number;
  height?: number;
  data?: string;
  image?: string | Buffer | Blob;
  imageTools?: typeof browserImageTools;
  qrOptions?: {
    typeNumber?: TypeNumber;
    mode?: Mode;
    errorCorrectionLevel?: ErrorCorrectionLevel;
  };
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    crossOrigin?: string;
    margin?: number;
  };
  dotsOptions?: {
    type?: DotType;
    color?: string;
    gradient?: Gradient;
  };
  cornersSquareOptions?: {
    type?: CornerSquareType;
    color?: string;
    gradient?: Gradient;
  };
  cornersDotOptions?: {
    type?: CornerDotType;
    color?: string;
    gradient?: Gradient;
  };
  backgroundOptions?:
    | {
        round?: number;
        color?: string;
        gradient?: Gradient;
        margin?: number;
      }
    | false;
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
