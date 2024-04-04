import { ErrorCorrectionPercents } from "./constants/errorCorrectionPercents";
import { QRCodeStyling } from "./core/QRCodeStyling";
import * as _browserUtils from "./tools/browserUtils";

export const browserUtils: typeof _browserUtils | undefined = _browserUtils;

export * from "./types";
export { ErrorCorrectionPercents, QRCodeStyling };
