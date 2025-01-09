export { ErrorCorrectionLevel, Mode, TypeNumber } from '@liquid-js/qrcode-generator/lib/qrcode/QRCodeMinimal.js'
export { QRCodeStyling, type ExtensionFunction } from './core/qr-code-styling.js'
export { FileExtension } from './tools/browser-utils.js'
export { type RecursivePartial } from './types/helper.js'
export { type CanvasOptions } from './utils/canvas-options.js'
export { GradientType, type Gradient } from './utils/gradient.js'
export { CornerDotType, CornerSquareType, DotType, ImageMode, ShapeType, type Options } from './utils/options.js'
export { ErrorCorrectionPercents } from './utils/qrcode.js'
import * as _browserUtils from './tools/browser-utils.js'

export const browserUtils: typeof _browserUtils | undefined = _browserUtils
