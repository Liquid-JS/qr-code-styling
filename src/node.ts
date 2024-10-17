import { DOMImplementation, DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { QRCodeStyling as _QRCodeStyling } from "./core/qr-code-styling.js";
import type * as _browserUtils from "./tools/browser-utils.js";
import { RecursivePartial } from "./types/helper.js";
import { Options } from "./utils/options.js";
export { type ExtensionFunction } from "./core/qr-code-styling.js";
export { FileExtension } from "./tools/browser-utils.js";
export { type RecursivePartial } from "./types/helper.js";
export { ErrorCorrectionLevel, Mode, TypeNumber } from "./types/qrcode.js";
export { type CanvasOptions } from "./utils/canvas-options.js";
export { GradientType, type Gradient } from "./utils/gradient.js";
export { CornerDotType, CornerSquareType, DotType, ShapeType, type Options } from "./utils/options.js";
export { ErrorCorrectionPercents } from "./utils/qrcode.js";

export const browserUtils: typeof _browserUtils | undefined = undefined;

export class QRCodeStyling extends _QRCodeStyling {
  constructor(options: RecursivePartial<Options>) {
    const dom = new DOMImplementation().createDocument(null, "");
    const imageCache = new Map<string, Promise<{ contentType?: string | null; data: Buffer }>>();

    const loadImage = async function (url: string | Buffer | Blob) {
      if (typeof url == "string") {
        let pr = imageCache.get(url);
        if (pr) return pr;
        pr = fetch(url).then((res) =>
          res
            .arrayBuffer()
            .then((buff) => Buffer.from(buff))
            .then(async (data) => ({
              contentType: res.headers.get("Content-Type") || (await fileTypeFromBuffer(data).then((r) => r?.mime)),
              data
            }))
        );
        imageCache.set(url, pr);
        return pr;
      } else {
        const buff = Buffer.from(url as Buffer);
        const mime = await fileTypeFromBuffer(buff).then((r) => r?.mime);
        return {
          contentType: mime,
          data: buff
        };
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.XMLSerializer = XMLSerializer as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.DOMParser = DOMParser as any;

    super({
      ...options,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document: options.document || (dom as any),
      imageTools: options.imageTools || {
        toDataURL: (url: string | Buffer | Blob): Promise<string> => {
          if (typeof url == "string" && url.startsWith("data:")) return Promise.resolve(url);
          return loadImage(url).then(
            ({ contentType, data }) =>
              `data:${contentType?.replace("application/xml", "image/svg+xml")};base64,${data.toString("base64")}`
          );
        },
        getSize: async (src: string | Blob | Buffer): Promise<{ width: number; height: number }> => {
          const { data } = Buffer.isBuffer(options.image) ? { data: options.image } : await loadImage(src);
          const meta = await sharp(data).metadata();
          return {
            width: meta.width!,

            height: meta.height!
          };
        }
      }
    });
  }
}
