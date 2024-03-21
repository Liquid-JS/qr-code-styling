import { ErrorCorrectionPercents } from "./constants/errorCorrectionPercents";
import { QRCodeStyling } from "./core/QRCodeStyling";
import * as browserUtils from "./tools/browserUtils";

export * from "./types";
export { ErrorCorrectionPercents, QRCodeStyling };

export default {
  QRCodeStyling,
  browserUtils
};
