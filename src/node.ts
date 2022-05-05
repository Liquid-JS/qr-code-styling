import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import sharp from "sharp";
import { RequiredOptions } from "./core/QROptions";
import { QRCodeStyling as _QRCodeStyling } from "./index";
export * from "./index";

export class QRCodeStyling extends _QRCodeStyling {
  constructor(options: RequiredOptions) {
    const dom = new JSDOM("<!DOCTYPE html>");
    const imageCache = new Map<string, Promise<{ contentType?: string | null; data: Buffer }>>();

    const loadImage = (url: string) => {
      let pr = imageCache.get(url);
      if (pr) return pr;
      pr = fetch(url).then((res) =>
        res.arrayBuffer().then((buff) => ({
          contentType: res.headers.get("Content-Type"),
          data: Buffer.from(buff)
        }))
      );
      imageCache.set(url, pr);
      return pr;
    };

    global.XMLSerializer = dom.window.XMLSerializer;

    super({
      ...options,
      document: options.document || dom.window.document,
      imageTools: options.imageTools || {
        toDataURL: (url: string) =>
          loadImage(url).then(({ contentType, data }) => `data:${contentType};base64,${data.toString("base64")}`),
        getSize: async (options) => {
          if (!options.image) {
            throw new Error("Image is not defined");
          }
          const { data } = await loadImage(options.image);
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
