import { CanvasOptions, DotType, ErrorCorrectionLevel, Gradient, Mode, Options, ShapeType, TypeNumber } from "../types";

export interface RequiredOptions extends Options {
  document: Document;
  shape: ShapeType;
  width: number;
  height: number;
  margin: number;
  data: string;
  qrOptions: {
    typeNumber: TypeNumber;
    mode?: Mode;
    errorCorrectionLevel: ErrorCorrectionLevel;
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    crossOrigin?: string;
    margin: number;
  };
  dotsOptions: {
    type: DotType;
    color: string;
    gradient?: Gradient;
  };
}

export const defaultOptions: RequiredOptions = {
  document: undefined as never,
  shape: ShapeType.square,
  width: undefined as never,
  height: undefined as never,
  margin: 0,
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
    color: "#000"
  }
};

export interface RequiredCanvasOptions extends CanvasOptions {
  width: number;
  height: number;
  margin: number;
}

export const defaultCanvasOptions: RequiredCanvasOptions = {
  width: 300,
  height: 300,
  margin: 10
};
