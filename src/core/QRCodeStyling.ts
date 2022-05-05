import qrcode from "qrcode-generator";
import { getMode } from "../tools/getMode";
import { mergeDeep } from "../tools/merge";
import { sanitizeOptions } from "../tools/sanitizeOptions";
import { ExtensionFunction, Options, QRCode } from "../types";
import { defaultOptions, RequiredOptions } from "./QROptions";
import { QRSVG } from "./QRSVG";
export class QRCodeStyling {
  _options: RequiredOptions;
  _container?: HTMLElement;
  _svg?: SVGElement;
  _qr?: QRCode;
  _extension?: ExtensionFunction;
  _svgDrawingPromise?: Promise<void>;

  constructor(options?: Partial<Options>) {
    this._options = options ? sanitizeOptions(mergeDeep(defaultOptions, options) as RequiredOptions) : defaultOptions;
    this.update();
  }

  static _clearContainer(container?: HTMLElement): void {
    if (container) {
      container.innerHTML = "";
    }
  }

  _setupSvg(): void {
    if (!this._qr) {
      return;
    }
    const qrSVG = new QRSVG(this._options);

    this._svg = qrSVG.getElement();
    this._svgDrawingPromise = qrSVG.drawQR(this._qr).then(() => {
      if (!this._svg) return;
      this._extension?.(qrSVG.getElement(), this._options);
    });
  }

  async _getElement(): Promise<SVGElement | undefined> {
    if (!this._qr) throw "QR code is empty";

    if (!this._svg || !this._svgDrawingPromise) {
      this._setupSvg();
    }
    await this._svgDrawingPromise;
    return this._svg;
  }

  update(options?: Partial<Options>): void {
    QRCodeStyling._clearContainer(this._container);
    this._options = options ? sanitizeOptions(mergeDeep(this._options, options) as RequiredOptions) : this._options;

    if (!this._options.data) {
      return;
    }

    this._qr = qrcode(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
    this._qr.addData(this._options.data, this._options.qrOptions.mode || getMode(this._options.data));
    this._qr.make();

    this._setupSvg();

    this.append(this._container);
  }

  append(container?: HTMLElement): void {
    if (!container) {
      return;
    }

    if (typeof container.appendChild !== "function") {
      throw "Container should be a single DOM node";
    }

    if (this._svg) {
      container.appendChild(this._svg);
    }

    this._container = container;
  }

  applyExtension(extension: ExtensionFunction): void {
    if (!extension) {
      throw "Extension function should be defined.";
    }

    this._extension = extension;
    this.update();
  }

  deleteExtension(): void {
    this._extension = undefined;
    this.update();
  }

  async serialize(): Promise<string | undefined> {
    if (!this._qr) throw "QR code is empty";

    const element = await this._getElement();

    if (!element) {
      return;
    }

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(element);

    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    return source;
  }
}
