import { RequiredOptions } from "../core/QROptions";

export const browser = {
  toDataURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = xhr.onabort = xhr.ontimeout = reject;
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    });
  },
  getSize(options: RequiredOptions): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (!options.image) {
        return reject("Image is not defined");
      }

      const image = new Image();

      if (typeof options.imageOptions.crossOrigin === "string") {
        image.crossOrigin = options.imageOptions.crossOrigin;
      }

      image.onload = (): void => {
        resolve({ width: image.width, height: image.height });
      };
      image.onerror = image.onabort = reject;
      image.src = options.image;
    });
  }
};
