import { QRCodeStyling } from "../core/QRCodeStyling";
import { FileExtension } from "../types";

export function drawToCanvas(
  qrCode: QRCodeStyling
): { canvas: HTMLCanvasElement; canvasDrawingPromise: Promise<void> | undefined } | undefined {
  if (!qrCode._qr) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = qrCode._options.width;
  canvas.height = qrCode._options.height;

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
        canvas?.getContext("2d")?.drawImage(image, 0, 0);
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
  downloadOptions: FileExtension | { name?: string; extension: FileExtension }
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
    const res = drawToCanvas(qrCode);
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
