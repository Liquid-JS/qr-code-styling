import { DotType, ErrorCorrectionLevel, Gradient, Mode, Options, ShapeType, TypeNumber } from "../types";

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
  width: 300,
  height: 300,
  data: "",
  margin: 0,
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
