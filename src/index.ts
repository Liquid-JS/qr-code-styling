export { type ExtensionFunction, QRCodeStyling } from "./core/qr-code-styling.js";
export { FileExtension } from "./tools/browser-utils.js";
export { type RecursivePartial } from "./types/helper.js";
export { ErrorCorrectionLevel, Mode, TypeNumber } from "./types/qrcode.js";
export { type CanvasOptions } from "./utils/canvas-options.js";
export { type Gradient, GradientType } from "./utils/gradient.js";
export { CornerDotType, CornerSquareType, DotType, type Options, ShapeType } from "./utils/options.js";
export { ErrorCorrectionPercents } from "./utils/qrcode.js";
import * as _browserUtils from "./tools/browser-utils.js";

export const browserUtils: typeof _browserUtils | undefined = _browserUtils;
