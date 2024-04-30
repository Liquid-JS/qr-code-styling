import { ErrorCorrectionPercents } from "../constants/errorCorrectionPercents.js";
import { QRCornerDot } from "../figures/cornerDot/QRCornerDot.js";
import { QRCornerSquare } from "../figures/cornerSquare/QRCornerSquare.js";
import { QRDot } from "../figures/dot/QRDot.js";
import { browserImageTools } from "../tools/browserImageTools.js";
import { calculateImageSize } from "../tools/calculateImageSize.js";
import { FilterFunction, Gradient, GradientType, QRCode, ShapeType } from "../types/index.js";
import { RequiredOptions } from "./QROptions.js";

const squareMask = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

const dotMask = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
];

const alignmentCount = [
  [35, 49],
  [28, 36],
  [21, 25],
  [14, 16],
  [7, 9],
  [2, 4],
  [1, 1]
];

export class QRSVG {
  /** @ignore */
  _element: SVGElement;
  /** @ignore */
  _defs: SVGElement;
  /** @ignore */
  _backgroundClipPath?: SVGElement;
  /** @ignore */
  _dotsClipPath?: SVGElement;
  /** @ignore */
  _cornersSquareClipPath?: SVGElement;
  /** @ignore */
  _cornersDotClipPath?: SVGElement;
  /** @ignore */
  _options: RequiredOptions;
  /** @ignore */
  _qr?: QRCode;
  /** @ignore */
  _document: Document;
  /** @ignore */
  private _imageTools: typeof browserImageTools;

  //TODO don't pass all options to this class
  constructor(options: RequiredOptions) {
    this._document = options.document;
    this._element = this._document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._element.setAttribute("width", String(options.width));
    this._element.setAttribute("height", String(options.height));
    this._element.setAttribute("viewBox", `0 0 ${options.width} ${options.height}`);
    this._defs = this._document.createElementNS("http://www.w3.org/2000/svg", "defs");
    this._element.appendChild(this._defs);
    this._imageTools = options.imageTools || browserImageTools;

    this._options = options;
  }

  get width(): number {
    return this._options.width;
  }

  get height(): number {
    return this._options.height;
  }

  getElement(): SVGElement {
    return this._element;
  }

  async drawQR(qr: QRCode): Promise<void> {
    const count = qr.getModuleCount();
    const typeNumber = parseInt(((count - 17) / 4).toFixed(0), 10);
    const dotSize = this._options.dotsOptions.size;
    let drawImageSize = {
      hideXDots: 0,
      hideYDots: 0,
      width: 0,
      height: 0
    };

    this._qr = qr;

    if (this._options.image) {
      //We need it to get image size
      const size = await this._imageTools.getSize(this._options);
      const { imageOptions, qrOptions } = this._options;
      const coverLevel = imageOptions.imageSize * ErrorCorrectionPercents[qrOptions.errorCorrectionLevel];
      const alignment = alignmentCount.find((v) => v[0] <= typeNumber) || [0, 0];
      const maxHiddenDots = Math.floor(coverLevel * (count * count - 3 * 8 * 8 - 2 * (count - 16) - alignment[1] * 25));

      drawImageSize = calculateImageSize({
        originalWidth: size.width,
        originalHeight: size.height,
        maxHiddenDots,
        maxHiddenAxisDots: count - 14,
        dotSize,
        margin: imageOptions.margin
      });
    }

    this.drawBackground();
    this.drawDots((i: number, j: number): boolean => {
      if (this._options.imageOptions.hideBackgroundDots) {
        if (
          i >= (count - drawImageSize.hideXDots) / 2 &&
          i < (count + drawImageSize.hideXDots) / 2 &&
          j >= (count - drawImageSize.hideYDots) / 2 &&
          j < (count + drawImageSize.hideYDots) / 2
        ) {
          return false;
        }
      }

      if (squareMask[i]?.[j] || squareMask[i - count + 7]?.[j] || squareMask[i]?.[j - count + 7]) {
        return false;
      }

      if (dotMask[i]?.[j] || dotMask[i - count + 7]?.[j] || dotMask[i]?.[j - count + 7]) {
        return false;
      }

      return true;
    });
    this.drawCorners();

    if (this._options.image && drawImageSize.width > 0 && drawImageSize.height > 0) {
      await this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize });
    }
  }

  drawBackground(): void {
    const element = this._element;
    const options = this._options;

    if (element && options.backgroundOptions) {
      const gradientOptions = options.backgroundOptions.gradient;
      const color = options.backgroundOptions.color;

      this._createColor({
        options: gradientOptions,
        color: color,
        additionalRotation: 0,
        x: 0,
        y: 0,
        height: options.height,
        width: options.width,
        name: "background-color"
      });

      const size = Math.min(options.width, options.height);
      const element = this._document.createElementNS("http://www.w3.org/2000/svg", "rect");
      this._backgroundClipPath = this._document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      this._backgroundClipPath.setAttribute("id", "clip-path-background-color");
      this._defs.appendChild(this._backgroundClipPath);

      element.setAttribute("x", String((options.width - size) / 2));
      element.setAttribute("y", String((options.height - size) / 2));
      element.setAttribute("width", String(size));
      element.setAttribute("height", String(size));
      element.setAttribute("rx", String((size / 2) * (options.backgroundOptions.round || 0)));

      this._backgroundClipPath.appendChild(element);
    }
  }

  drawDots(filter?: FilterFunction): void {
    if (!this._qr) {
      throw "QR code is not defined";
    }

    const options = this._options;
    const count = this._qr.getModuleCount();

    if (count > options.width || count > options.height) {
      throw "The canvas is too small.";
    }

    const minSize = Math.min(options.width, options.height);
    const dotSize = this._options.dotsOptions.size;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    const dot = new QRDot({ svg: this._element, type: options.dotsOptions.type, document: this._document });

    this._dotsClipPath = this._document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    this._dotsClipPath.setAttribute("id", "clip-path-dot-color");
    this._defs.appendChild(this._dotsClipPath);

    this._createColor({
      options: options.dotsOptions?.gradient,
      color: options.dotsOptions.color,
      additionalRotation: 0,
      x: 0,
      y: 0,
      height: options.height,
      width: options.width,
      name: "dot-color"
    });

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        if (filter && !filter(i, j)) {
          continue;
        }
        if (!this._qr?.isDark(j, i)) {
          continue;
        }

        dot.draw(
          xBeginning + i * dotSize,
          yBeginning + j * dotSize,
          dotSize,
          (xOffset: number, yOffset: number): boolean => {
            if (i + xOffset < 0 || j + yOffset < 0 || i + xOffset >= count || j + yOffset >= count) return false;
            if (filter && !filter(i + xOffset, j + yOffset)) return false;
            return !!this._qr && this._qr.isDark(j + yOffset, i + xOffset);
          }
        );

        if (dot._element && this._dotsClipPath) {
          this._dotsClipPath.appendChild(dot._element);
        }
      }
    }

    if (options.shape === ShapeType.circle) {
      const margin = (this._options.backgroundOptions && this._options.backgroundOptions.margin) || 0;
      const additionalDots = Math.floor((minSize / dotSize - count - 2 * margin) / 2);
      const fakeCount = count + additionalDots * 2;
      const xFakeBeginning = xBeginning - additionalDots * dotSize;
      const yFakeBeginning = yBeginning - additionalDots * dotSize;
      const fakeMatrix: number[][] = [];
      const center = Math.floor(fakeCount / 2);

      for (let i = 0; i < fakeCount; i++) {
        fakeMatrix[i] = [];
        for (let j = 0; j < fakeCount; j++) {
          if (
            i >= additionalDots - 1 &&
            i <= fakeCount - additionalDots &&
            j >= additionalDots - 1 &&
            j <= fakeCount - additionalDots
          ) {
            fakeMatrix[i][j] = 0;
            continue;
          }

          if (Math.sqrt((i - center) * (i - center) + (j - center) * (j - center)) > center) {
            fakeMatrix[i][j] = 0;
            continue;
          }

          //Get random dots from QR code to show it outside of QR code
          fakeMatrix[i][j] = this._qr.isDark(
            j - 2 * additionalDots < 0 ? j : j >= count ? j - 2 * additionalDots : j - additionalDots,
            i - 2 * additionalDots < 0 ? i : i >= count ? i - 2 * additionalDots : i - additionalDots
          )
            ? 1
            : 0;
        }
      }

      for (let i = 0; i < fakeCount; i++) {
        for (let j = 0; j < fakeCount; j++) {
          if (!fakeMatrix[i][j]) continue;

          dot.draw(
            xFakeBeginning + i * dotSize,
            yFakeBeginning + j * dotSize,
            dotSize,
            (xOffset: number, yOffset: number): boolean => {
              return !!fakeMatrix[i + xOffset]?.[j + yOffset];
            }
          );
          if (dot._element && this._dotsClipPath) {
            this._dotsClipPath.appendChild(dot._element);
          }
        }
      }
    }
  }

  drawCorners(): void {
    if (!this._qr) {
      throw "QR code is not defined";
    }

    const element = this._element;
    const options = this._options;

    if (!element) {
      throw "Element code is not defined";
    }

    const count = this._qr.getModuleCount();
    const dotSize = this._options.dotsOptions.size;
    const cornersSquareSize = dotSize * 7;
    const cornersDotSize = dotSize * 3;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);

    [
      [0, 0, 0],
      [1, 0, Math.PI / 2],
      [0, 1, -Math.PI / 2]
    ].forEach(([column, row, rotation]) => {
      const x = xBeginning + column * dotSize * (count - 7);
      const y = yBeginning + row * dotSize * (count - 7);
      let cornersSquareClipPath = this._dotsClipPath;
      let cornersDotClipPath = this._dotsClipPath;

      if (options.cornersSquareOptions?.gradient || options.cornersSquareOptions?.color) {
        cornersSquareClipPath = this._document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        cornersSquareClipPath.setAttribute("id", `clip-path-corners-square-color-${column}-${row}`);
        this._defs.appendChild(cornersSquareClipPath);
        this._cornersSquareClipPath = this._cornersDotClipPath = cornersDotClipPath = cornersSquareClipPath;

        this._createColor({
          options: options.cornersSquareOptions?.gradient,
          color: options.cornersSquareOptions?.color,
          additionalRotation: rotation,
          x,
          y,
          height: cornersSquareSize,
          width: cornersSquareSize,
          name: `corners-square-color-${column}-${row}`
        });
      }

      if (options.cornersSquareOptions?.type) {
        const cornersSquare = new QRCornerSquare({
          svg: this._element,
          type: options.cornersSquareOptions.type,
          document: this._document
        });

        cornersSquare.draw(x, y, cornersSquareSize, rotation);

        if (cornersSquare._element && cornersSquareClipPath) {
          cornersSquareClipPath.appendChild(cornersSquare._element);
        }
      } else {
        const dot = new QRDot({ svg: this._element, type: options.dotsOptions.type, document: this._document });

        for (let i = 0; i < squareMask.length; i++) {
          for (let j = 0; j < squareMask[i].length; j++) {
            if (!squareMask[i]?.[j]) {
              continue;
            }

            dot.draw(
              x + i * dotSize,
              y + j * dotSize,
              dotSize,
              (xOffset: number, yOffset: number): boolean => !!squareMask[i + xOffset]?.[j + yOffset]
            );

            if (dot._element && cornersSquareClipPath) {
              cornersSquareClipPath.appendChild(dot._element);
            }
          }
        }
      }

      if (options.cornersDotOptions?.gradient || options.cornersDotOptions?.color) {
        cornersDotClipPath = this._document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        cornersDotClipPath.setAttribute("id", `clip-path-corners-dot-color-${column}-${row}`);
        this._defs.appendChild(cornersDotClipPath);
        this._cornersDotClipPath = cornersDotClipPath;

        this._createColor({
          options: options.cornersDotOptions?.gradient,
          color: options.cornersDotOptions?.color,
          additionalRotation: rotation,
          x: x + dotSize * 2,
          y: y + dotSize * 2,
          height: cornersDotSize,
          width: cornersDotSize,
          name: `corners-dot-color-${column}-${row}`
        });
      }

      if (options.cornersDotOptions?.type) {
        const cornersDot = new QRCornerDot({
          svg: this._element,
          type: options.cornersDotOptions.type,
          document: this._document
        });

        cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);

        if (cornersDot._element && cornersDotClipPath) {
          cornersDotClipPath.appendChild(cornersDot._element);
        }
      } else {
        const dot = new QRDot({ svg: this._element, type: options.dotsOptions.type, document: this._document });

        for (let i = 0; i < dotMask.length; i++) {
          for (let j = 0; j < dotMask[i].length; j++) {
            if (!dotMask[i]?.[j]) {
              continue;
            }

            dot.draw(
              x + i * dotSize,
              y + j * dotSize,
              dotSize,
              (xOffset: number, yOffset: number): boolean => !!dotMask[i + xOffset]?.[j + yOffset]
            );

            if (dot._element && cornersDotClipPath) {
              cornersDotClipPath.appendChild(dot._element);
            }
          }
        }
      }
    });
  }

  async drawImage({
    width,
    height,
    count,
    dotSize
  }: {
    width: number;
    height: number;
    count: number;
    dotSize: number;
  }): Promise<void> {
    const options = this._options;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    const margin = options.imageOptions.margin * dotSize;
    const dx = xBeginning + margin + (count * dotSize - width) / 2;
    const dy = yBeginning + margin + (count * dotSize - height) / 2;
    const dw = width - margin * 2;
    const dh = height - margin * 2;

    const imageUrl = await this._imageTools.toDataURL(options.image || "");
    let image: SVGElement = this._document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute("href", imageUrl || "");

    if (imageUrl.startsWith("data:image/svg+xml;")) {
      let data = imageUrl.substring(19);
      const i = data.indexOf(",");
      const encoding = data.substring(0, i);
      data = data.substring(i + 1);

      switch (encoding) {
        case "base64":
          data = typeof atob == "function" ? atob(data) : Buffer.from(data, "base64").toString("utf8");
          break;
        default:
          data = "";
          break;
      }

      if (data) {
        const container = new DOMParser().parseFromString(data, "text/xml");
        const rootEl = Array.from(container.getElementsByTagName("svg"));
        if (rootEl.length) image = rootEl[0];
      }
    }

    image.setAttribute("x", String(dx));
    image.setAttribute("y", String(dy));
    image.setAttribute("width", `${dw}px`);
    image.setAttribute("height", `${dh}px`);

    this._element.appendChild(image);
  }

  /** @ignore */
  _createColor({
    options,
    color,
    additionalRotation,
    x,
    y,
    height,
    width,
    name
  }: {
    options?: Gradient;
    color?: string;
    additionalRotation: number;
    x: number;
    y: number;
    height: number;
    width: number;
    name: string;
  }): void {
    const size = width > height ? width : height;
    const rect = this._document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("height", String(height));
    rect.setAttribute("width", String(width));
    rect.setAttribute("clip-path", `url('#clip-path-${name}')`);

    if (options) {
      let gradient: SVGElement;
      if (options.type === GradientType.radial) {
        gradient = this._document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
        gradient.setAttribute("id", name);
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        gradient.setAttribute("fx", String(x + width / 2));
        gradient.setAttribute("fy", String(y + height / 2));
        gradient.setAttribute("cx", String(x + width / 2));
        gradient.setAttribute("cy", String(y + height / 2));
        gradient.setAttribute("r", String(size / 2));
      } else {
        const rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
        const positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
        let x0 = x + width / 2;
        let y0 = y + height / 2;
        let x1 = x + width / 2;
        let y1 = y + height / 2;

        if (
          (positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
          (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)
        ) {
          x0 = x0 - width / 2;
          y0 = y0 - (height / 2) * Math.tan(rotation);
          x1 = x1 + width / 2;
          y1 = y1 + (height / 2) * Math.tan(rotation);
        } else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
          y0 = y0 - height / 2;
          x0 = x0 - width / 2 / Math.tan(rotation);
          y1 = y1 + height / 2;
          x1 = x1 + width / 2 / Math.tan(rotation);
        } else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
          x0 = x0 + width / 2;
          y0 = y0 + (height / 2) * Math.tan(rotation);
          x1 = x1 - width / 2;
          y1 = y1 - (height / 2) * Math.tan(rotation);
        } else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
          y0 = y0 + height / 2;
          x0 = x0 + width / 2 / Math.tan(rotation);
          y1 = y1 - height / 2;
          x1 = x1 - width / 2 / Math.tan(rotation);
        }

        gradient = this._document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        gradient.setAttribute("id", name);
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        gradient.setAttribute("x1", String(Math.round(x0)));
        gradient.setAttribute("y1", String(Math.round(y0)));
        gradient.setAttribute("x2", String(Math.round(x1)));
        gradient.setAttribute("y2", String(Math.round(y1)));
      }

      options.colorStops.forEach(({ offset, color }: { offset: number; color: string }) => {
        const stop = this._document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop.setAttribute("offset", `${100 * offset}%`);
        stop.setAttribute("stop-color", color);
        gradient.appendChild(stop);
      });

      rect.setAttribute("fill", `url('#${name}')`);
      this._defs.appendChild(gradient);
    } else if (color) {
      rect.setAttribute("fill", color);
    }

    this._element.appendChild(rect);
  }
}
