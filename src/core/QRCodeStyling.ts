import qrcode from "qrcode-generator";
import { getMode } from "../tools/getMode";
import { mergeDeep } from "../tools/merge";
import { sanitizeOptions } from "../tools/sanitizeOptions";
import { ExtensionFunction, Mode, Options, QRCode, ShapeType } from "../types";
import { defaultOptions, RequiredOptions } from "./QROptions";
import { QRSVG } from "./QRSVG";

export class QRCodeStyling {
  /** @ignore */
  _options: RequiredOptions;
  /** @ignore */
  _container?: HTMLElement;
  /** @ignore */
  _svg?: SVGElement;
  /** @ignore */
  _qr?: QRCode;
  /** @ignore */
  _extension?: ExtensionFunction;
  /** @ignore */
  _svgDrawingPromise?: Promise<void>;

  constructor(options?: Partial<Options>) {
    this._options = options ? sanitizeOptions(mergeDeep(defaultOptions, options) as RequiredOptions) : defaultOptions;
    this.update();
  }

  /** @ignore */
  static _clearContainer(container?: HTMLElement): void {
    if (container) {
      container.innerHTML = "";
    }
  }

  /** @ignore */
  _setupSvg(): void {
    if (!this._qr) {
      return;
    }
    const count = Math.ceil((this._options.shape == ShapeType.circle ? Math.sqrt(2) : 1) * this._qr.getModuleCount());
    const margin = (this._options.backgroundOptions && this._options.backgroundOptions.margin) || 0;
    const size = Math.ceil(this._options.dotsOptions.size * (count + 2 * margin));
    const qrSVG = new QRSVG({
      ...this._options,
      width: size,
      height: size
    });

    this._svg = qrSVG.getElement();
    this._svgDrawingPromise = qrSVG.drawQR(this._qr).then(() => {
      if (!this._svg) return;
      this._extension?.(qrSVG.getElement(), this._options);
    });
  }

  /** @ignore */
  async _getElement(): Promise<SVGElement | undefined> {
    if (!this._qr) throw "QR code is empty";

    if (!this._svg || !this._svgDrawingPromise) {
      this._setupSvg();
    }
    await this._svgDrawingPromise;
    return this._svg;
  }

  update(
    /** The same options as for initialization */
    options?: Partial<Options>
  ): void {
    QRCodeStyling._clearContainer(this._container);
    this._options = options ? sanitizeOptions(mergeDeep(this._options, options) as RequiredOptions) : this._options;

    if (!this._options.data) {
      return;
    }

    if (this._options.stringToBytesFuncs) {
      Object.assign(qrcode.stringToBytesFuncs, this._options.stringToBytesFuncs);
      delete this._options.stringToBytesFuncs;
    }

    this._qr = qrcode(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
    let mode = this._options.qrOptions.mode || getMode(this._options.data);
    if (mode == Mode.unicode) {
      qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
      mode = Mode.byte;
    } else {
      qrcode.stringToBytes = qrcode.stringToBytesFuncs["default"];
    }
    this._qr.addData(this._options.data, mode);
    this._qr.make();

    this._setupSvg();

    this.append(this._container);
  }

  append(
    /** This container will be used for appending of the QR code */
    container?: HTMLElement
  ): void {
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

  /**
   *
   * @example
   *
   * ```js
   * const extension = (svg, options) => {
   *   const { width, height } = options;
   *   const size = Math.min(width, height);
   *   const border = options.document.createElementNS("http://www.w3.org/2000/svg", "rect");
   *   const borderAttributes = {
   *     fill: "none",
   *     x: (width - size + 40) / 2,
   *     y: (height - size + 40) / 2,
   *     width: size - 40,
   *     height: size - 40,
   *     stroke: "black",
   *     "stroke-width": 40,
   *     rx: 100
   *   };
   *   Object.keys(borderAttributes).forEach((attribute) => {
   *     border.setAttribute(attribute, borderAttributes[attribute]);
   *   });
   *   svg.appendChild(border);
   * };
   * ```
   */
  applyExtension(
    /** Extension is a function that takes svg and previously applied options and modifies an svg */
    extension: ExtensionFunction
  ): void {
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
