import { DOMImplementation, XMLSerializer, DOMParser } from "@xmldom/xmldom";
import { fromBuffer } from "file-type";
import fetch from "node-fetch";
import sharp from "sharp";
import { RequiredOptions } from "./core/QROptions";
import { QRCodeStyling as _QRCodeStyling } from "./index";
export { ErrorCorrectionPercents } from "./constants/errorCorrectionPercents";
export * from "./types";

export class QRCodeStyling extends _QRCodeStyling {
  constructor(options: RequiredOptions) {
    const dom = new DOMImplementation().createDocument(null, null);
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
              contentType: res.headers.get("Content-Type") || (await fromBuffer(data).then((r) => r?.mime)),
              data
            }))
        );
        imageCache.set(url, pr);
        return pr;
      } else {
        const buff = Buffer.from(url as Buffer);
        const mime = await fromBuffer(buff).then((r) => r?.mime);
        return {
          contentType: mime,
          data: buff
        };
      }
    };

    global.XMLSerializer = XMLSerializer;
    global.DOMParser = DOMParser;

    super({
      ...options,
      document: options.document || dom,
      imageTools: options.imageTools || {
        toDataURL: (url) =>
          loadImage(url).then(
            ({ contentType, data }) =>
              `data:${contentType?.replace("application/xml", "image/svg+xml")};base64,${data.toString("base64")}`
          ),
        getSize: async function (options) {
          if (!options.image) {
            throw new Error("Image is not defined");
          }
          const { data } = Buffer.isBuffer(options.image) ? { data: options.image } : await loadImage(options.image);
          const meta = await sharp(data).metadata();
          return {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            width: meta.width!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            height: meta.height!
          };
        }
      }
    });
  }
}
