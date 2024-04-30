import { QRCodeStyling } from "../core/QRCodeStyling.js";
import { defaultCanvasOptions, RequiredCanvasOptions } from "../core/QROptions.js";
import { CanvasOptions, FileExtension } from "../types/index.js";
import { mergeDeep } from "./merge.js";
import { sanitizeCanvasOptions } from "./sanitizeOptions.js";

export function drawToCanvas(
  qrCode: QRCodeStyling,
  options?: CanvasOptions
): { canvas: HTMLCanvasElement; canvasDrawingPromise: Promise<void> | undefined } | undefined {
  if (!qrCode._qr) {
    return;
  }

  const { width, height, margin } = options
    ? sanitizeCanvasOptions(mergeDeep(defaultCanvasOptions, options) as RequiredCanvasOptions)
    : defaultCanvasOptions;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const size = Math.min(width, height) - 2 * margin;

  qrCode._setupSvg();
  const canvasDrawingPromise = qrCode._svgDrawingPromise?.then(async () => {
    if (!qrCode._svg) return;

    const xml = await qrCode.serialize();
    if (!xml) return;
    const svg64 = btoa(xml);
    const image64 = "data:image/svg+xml;base64," + svg64;
    const image = new Image();

    return new Promise<void>((resolve, reject) => {
      image.onload = (): void => {
        // Ensure pixel-perfect rendering of SVG to avoid artefact, then downscale to requested size
        const aaFactor = Math.ceil((2 * size) / Math.min(image.width, image.height));
        let aaCanvas: HTMLCanvasElement | OffscreenCanvas;
        try {
          aaCanvas = new OffscreenCanvas(image.width * aaFactor, image.height * aaFactor);
        } catch (_) {
          // Fallback to regular canvas element
          aaCanvas = document.createElement("canvas");
          aaCanvas.width = image.width * aaFactor;
          aaCanvas.height = image.height * aaFactor;
        }
        aaCanvas.getContext("2d")?.drawImage(image, 0, 0, aaCanvas.width, aaCanvas.height);

        canvas?.getContext("2d")?.drawImage(aaCanvas, (width - size) / 2, (height - size) / 2, size, size);
        resolve();
      };
      image.onerror = image.onabort = reject;

      image.src = image64;
    });
  });

  return { canvas, canvasDrawingPromise };
}

export async function download(
  qrCode: QRCodeStyling,
  downloadOptions: FileExtension | { name?: string; extension: FileExtension },
  options?: CanvasOptions
): Promise<void> {
  if (!qrCode._qr) throw "QR code is empty";
  let extension = FileExtension.png;
  let name = "qr";

  //TODO remove deprecated code in the v2
  if (typeof downloadOptions === "string") {
    extension = downloadOptions;
    console.warn(
      "Extension is deprecated as argument for 'download' method, please pass object { name: '...', extension: '...' } as argument"
    );
  } else if (typeof downloadOptions === "object" && downloadOptions !== null) {
    if (downloadOptions.name) {
      name = downloadOptions.name;
    }
    if (downloadOptions.extension) {
      extension = downloadOptions.extension;
    }
  }

  if (extension.toLowerCase() === "svg") {
    let source = await qrCode.serialize();
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    downloadURI(url, `${name}.svg`);
  } else {
    const res = drawToCanvas(qrCode, options);
    if (!res) return;
    const { canvas, canvasDrawingPromise } = res;
    await canvasDrawingPromise;
    const url = canvas.toDataURL(`image/${extension}`);
    downloadURI(url, `${name}.${extension}`);
  }
}

export function downloadURI(uri: string, name: string): void {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
