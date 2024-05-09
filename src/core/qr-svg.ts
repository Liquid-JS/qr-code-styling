import { QRCornerDot } from "../figures/corner-dot.js";
import { QRCornerSquare } from "../figures/corner-square.js";
import { QRDot } from "../figures/dot.js";
import { browserImageTools } from "../tools/browser-image-tools.js";
import { Gradient, GradientType } from "../utils/gradient.js";
import { calculateImageSize } from "../utils/image.js";
import { Options, ShapeType } from "../utils/options.js";

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
  private _element: SVGElement;

  get element() {
    return this._element;
  }

  private defs: SVGElement;

  private backgroundMask?: SVGElement;
  private backgroundMaskGroup?: SVGElement;

  private dotsMask?: SVGElement;
  private dotsMaskGroup?: SVGElement;

  private qr?: QRCode;
  private document: Document;
  private imageTools: typeof browserImageTools;

  constructor(
    private options: Pick<
      Options,
      | "width"
      | "height"
      | "document"
      | "imageTools"
      | "image"
      | "imageOptions"
      | "dotsOptions"
      | "cornersDotOptions"
      | "cornersSquareOptions"
      | "backgroundOptions"
      | "shape"
    > & { errorCorrectionPercent: number }
  ) {
    this.document = options.document;
    this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._element.setAttribute("width", String(options.width));
    this._element.setAttribute("height", String(options.height));
    this._element.setAttribute("viewBox", `0 0 ${options.width} ${options.height}`);
    this.defs = this.document.createElementNS("http://www.w3.org/2000/svg", "defs");
    this._element.appendChild(this.defs);
    this.imageTools = options.imageTools || browserImageTools;
  }

  get width(): number {
    return this.options.width;
  }

  get height(): number {
    return this.options.height;
  }

  async drawQR(qr: QRCode): Promise<void> {
    const count = qr.getModuleCount();
    const typeNumber = parseInt(((count - 17) / 4).toFixed(0), 10);
    const dotSize = this.options.dotsOptions.size;
    let drawImageSize = {
      hideXDots: 0,
      hideYDots: 0,
      width: 0,
      height: 0
    };

    this.qr = qr;

    if (this.options.image) {
      //We need it to get image size
      const size = await this.imageTools.getSize(this.options.image, this.options.imageOptions.crossOrigin);
      const { imageOptions, errorCorrectionPercent } = this.options;
      const coverLevel = imageOptions.imageSize * errorCorrectionPercent;
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
      if (this.options.imageOptions.hideBackgroundDots) {
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

    if (this.options.image && drawImageSize.width > 0 && drawImageSize.height > 0) {
      await this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize });
    }
  }

  drawBackground(): void {
    const element = this._element;
    const options = this.options;

    if (element && options.backgroundOptions) {
      const gradientOptions = options.backgroundOptions.gradient;
      const color = options.backgroundOptions.color;

      this.createColor({
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
      const element = this.document.createElementNS("http://www.w3.org/2000/svg", "rect");
      [this.backgroundMask, this.backgroundMaskGroup] = this.createMask("mask-background-color");
      this.defs.appendChild(this.backgroundMask);

      element.setAttribute("x", String((options.width - size) / 2));
      element.setAttribute("y", String((options.height - size) / 2));
      element.setAttribute("width", String(size));
      element.setAttribute("height", String(size));
      element.setAttribute("rx", String((size / 2) * (options.backgroundOptions.round || 0)));

      this.backgroundMaskGroup.appendChild(element);
    }
  }

  drawDots(filter?: (i: number, j: number) => boolean): void {
    if (!this.qr) {
      throw "QR code is not defined";
    }

    const options = this.options;
    const count = this.qr.getModuleCount();

    if (count > options.width || count > options.height) {
      throw "The canvas is too small.";
    }

    const minSize = Math.min(options.width, options.height);
    const dotSize = this.options.dotsOptions.size;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    const dot = new QRDot(options.dotsOptions.type, this.document);

    [this.dotsMask, this.dotsMaskGroup] = this.createMask("mask-dot-color");
    this.defs.appendChild(this.dotsMask);

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        if (filter && !filter(i, j)) {
          continue;
        }
        if (!this.qr?.isDark(j, i)) {
          continue;
        }

        dot.draw({
          x: xBeginning + i * dotSize,
          y: yBeginning + j * dotSize,
          size: dotSize,
          getNeighbor: (xOffset: number, yOffset: number): boolean => {
            if (i + xOffset < 0 || j + yOffset < 0 || i + xOffset >= count || j + yOffset >= count) return false;
            if (filter && !filter(i + xOffset, j + yOffset)) return false;
            return !!this.qr && this.qr.isDark(j + yOffset, i + xOffset);
          }
        });

        if (dot.element && this.dotsMask) {
          this.dotsMaskGroup.appendChild(dot.element);
        }
      }
    }

    let colorX = xBeginning;
    let colorY = yBeginning;
    let colorCount = count;

    if (options.shape === ShapeType.circle) {
      const margin = (this.options.backgroundOptions && this.options.backgroundOptions.margin) || 0;
      const additionalDots = Math.floor((minSize / dotSize - count - 2 * margin) / 2);
      const fakeCount = count + additionalDots * 2;
      const xFakeBeginning = xBeginning - additionalDots * dotSize;
      const yFakeBeginning = yBeginning - additionalDots * dotSize;
      colorX = xFakeBeginning;
      colorY = yFakeBeginning;
      colorCount = count + additionalDots * 2;
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
          fakeMatrix[i][j] = this.qr.isDark(
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

          dot.draw({
            x: xFakeBeginning + i * dotSize,
            y: yFakeBeginning + j * dotSize,
            size: dotSize,
            getNeighbor: (xOffset: number, yOffset: number): boolean => {
              return !!fakeMatrix[i + xOffset]?.[j + yOffset];
            }
          });
          if (dot.element && this.dotsMask) {
            this.dotsMaskGroup.appendChild(dot.element);
          }
        }
      }
    }

    this.createColor({
      options: options.dotsOptions?.gradient,
      color: options.dotsOptions.color,
      additionalRotation: 0,
      x: colorX,
      y: colorY,
      height: colorCount * dotSize,
      width: colorCount * dotSize,
      name: "dot-color"
    });
  }

  drawCorners(): void {
    if (!this.qr) {
      throw "QR code is not defined";
    }

    const element = this._element;
    const options = this.options;

    if (!element) {
      throw "Element code is not defined";
    }

    const count = this.qr.getModuleCount();
    const dotSize = this.options.dotsOptions.size;
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
      let cornersSquareMask = this.dotsMask;
      let cornersSquareMaskGroup = this.dotsMaskGroup;
      let cornersDotMask = this.dotsMask;
      let cornersDotMaskGroup = this.dotsMaskGroup;

      if (options.cornersSquareOptions?.gradient || options.cornersSquareOptions?.color) {
        [cornersSquareMask, cornersSquareMaskGroup] = this.createMask(`mask-corners-square-color-${column}-${row}`);
        this.defs.appendChild(cornersSquareMask);
        cornersDotMask = cornersSquareMask;
        cornersDotMaskGroup = cornersSquareMaskGroup;

        this.createColor({
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
        const cornersSquare = new QRCornerSquare(options.cornersSquareOptions.type, this.document);

        cornersSquare.draw({
          x,
          y,
          size: cornersSquareSize,
          rotation
        });

        if (cornersSquare.element && cornersSquareMaskGroup) {
          cornersSquareMaskGroup.appendChild(cornersSquare.element);
        }
      } else {
        const dot = new QRDot(options.dotsOptions.type, this.document);

        for (let i = 0; i < squareMask.length; i++) {
          for (let j = 0; j < squareMask[i].length; j++) {
            if (!squareMask[i]?.[j]) {
              continue;
            }

            dot.draw({
              x: x + i * dotSize,
              y: y + j * dotSize,
              size: dotSize,
              getNeighbor: (xOffset: number, yOffset: number): boolean => !!squareMask[i + xOffset]?.[j + yOffset]
            });

            if (dot.element && cornersSquareMaskGroup) {
              cornersSquareMaskGroup.appendChild(dot.element);
            }
          }
        }
      }

      if (options.cornersDotOptions?.gradient || options.cornersDotOptions?.color) {
        [cornersDotMask, cornersDotMaskGroup] = this.createMask(`mask-corners-dot-color-${column}-${row}`);
        this.defs.appendChild(cornersDotMask);

        this.createColor({
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
        const cornersDot = new QRCornerDot(options.cornersDotOptions.type, this.document);

        cornersDot.draw({
          x: x + dotSize * 2,
          y: y + dotSize * 2,
          size: cornersDotSize,
          rotation
        });

        if (cornersDot.element && cornersDotMaskGroup) {
          cornersDotMaskGroup.appendChild(cornersDot.element);
        }
      } else {
        const dot = new QRDot(options.dotsOptions.type, this.document);

        for (let i = 0; i < dotMask.length; i++) {
          for (let j = 0; j < dotMask[i].length; j++) {
            if (!dotMask[i]?.[j]) {
              continue;
            }

            dot.draw({
              x: x + i * dotSize,
              y: y + j * dotSize,
              size: dotSize,
              getNeighbor: (xOffset: number, yOffset: number): boolean => !!dotMask[i + xOffset]?.[j + yOffset]
            });

            if (dot.element && cornersDotMaskGroup) {
              cornersDotMaskGroup.appendChild(dot.element);
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
    const options = this.options;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    const margin = options.imageOptions.margin * dotSize;
    const dx = xBeginning + margin + (count * dotSize - width) / 2;
    const dy = yBeginning + margin + (count * dotSize - height) / 2;
    const dw = width - margin * 2;
    const dh = height - margin * 2;

    const imageUrl = await this.imageTools.toDataURL(options.image || "");
    let image: SVGElement = this.document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imageUrl || "");

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

  private createColor({
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
    const rect = this.document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("height", String(height));
    rect.setAttribute("width", String(width));
    rect.setAttribute("style", `mask:url(#mask-${name})`);

    if (options) {
      let gradient: SVGElement;
      if (options.type === GradientType.radial) {
        gradient = this.document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
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

        gradient = this.document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        gradient.setAttribute("id", name);
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        gradient.setAttribute("x1", String(Math.round(x0)));
        gradient.setAttribute("y1", String(Math.round(y0)));
        gradient.setAttribute("x2", String(Math.round(x1)));
        gradient.setAttribute("y2", String(Math.round(y1)));
      }

      options.colorStops.forEach(({ offset, color }: { offset: number; color: string }) => {
        const stop = this.document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop.setAttribute("offset", `${100 * offset}%`);
        stop.setAttribute("stop-color", color);
        gradient.appendChild(stop);
      });

      rect.setAttribute("fill", `url(#${name})`);
      this.defs.appendChild(gradient);
    } else if (color) {
      rect.setAttribute("fill", color);
    }

    this._element.appendChild(rect);
  }

  private createMask(id: string) {
    const options = this.options;

    const mask = this.document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.setAttribute("id", id);
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("x", "0");
    mask.setAttribute("y", "0");
    mask.setAttribute("width", String(options.width));
    mask.setAttribute("height", String(options.height));

    const group = this.document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("fill", "#fff");
    mask.appendChild(group);

    return [mask, group];
  }
}
