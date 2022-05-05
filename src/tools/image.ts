import { RequiredOptions } from "../core/QROptions";

export const browser = {
  toDataURL(url: string | Buffer | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof url == "string") {
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
      } else {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(url as Blob);
      }
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
      if (typeof options.image == "string") image.src = options.image;
      else
        browser
          .toDataURL(options.image)
          .then((url) => (image.src = url))
          .catch(reject);
    });
  }
};
