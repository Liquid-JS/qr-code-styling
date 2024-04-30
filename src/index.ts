import { ErrorCorrectionPercents } from "./constants/errorCorrectionPercents.js";
import { QRCodeStyling } from "./core/QRCodeStyling.js";
import * as _browserUtils from "./tools/browserUtils.js";

export const browserUtils: typeof _browserUtils | undefined = _browserUtils;

export * from "./types/index.js";
export { ErrorCorrectionPercents, QRCodeStyling };
