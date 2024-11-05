# QR Code Styling

[![Version](https://img.shields.io/npm/v/@liquid-js/qr-code-styling.svg)](https://www.npmjs.org/package/@liquid-js/qr-code-styling)

JavaScript library for generating QR codes with customizable styling.

Try it here <https://styled-qr.liquidjs.io/>

## Examples

<p float="left">
<img style="display:inline-block" src="https://raw.githubusercontent.com/Liquid-JS/qr-code-styling/master/src/assets/facebook.png" width="240" />
<img style="display:inline-block" src="https://raw.githubusercontent.com/Liquid-JS/qr-code-styling/master/src/assets/qr-styling.png" width="240" />
<img style="display:inline-block" src="https://raw.githubusercontent.com/Liquid-JS/qr-code-styling/master/src/assets/telegram.png" width="240" />
</p>

## Installation

    npm install @liquid-js/qr-code-styling

## API Documentation

<https://liquid-js.github.io/qr-code-styling/>

## Usage

### Browser

```HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>QR Code Styling</title>
  </head>
  <body>
    <div id="canvas"></div>
    <button type="button" id="dl">Download</button>
    <script type="module">
      import { QRCodeStyling, browserUtils } from "https://unpkg.com/@liquid-js/qr-code-styling/lib/qr-code-styling.js";

      const qrCode = new QRCodeStyling({
        data: "https://www.facebook.com/",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
        dotsOptions: {
          color: "#4267b2",
          type: "rounded",
          size: 10
        },
        backgroundOptions: {
          color: "#e9ebee",
          margin: 1
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 1,
          imageSize: 0.5
        }
      });

      qrCode.append(document.getElementById("canvas"));

      document.getElementById("dl").addEventListener("click", () => {
        browserUtils.download(qrCode, { extension: "png" }, { width: 1200, height: 1200 });
      });
    </script>
  </body>
</html>
```

### Node

> ⚠️ **Note**: make sure to install optional peer dependencies when running on Node (not needed for browser environments)
>
>     npm install @xmldom/xmldom file-type @liquid-js/qrcode-generator sharp

```js
import { QRCodeStyling } from "@liquid-js/qr-code-styling";
import { writeFile } from "fs/promises";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

const qrCode = new QRCodeStyling({
  data: "https://www.facebook.com/",
  image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
  dotsOptions: {
    color: "#4267b2",
    type: "rounded",
    size: 10
  },
  backgroundOptions: {
    color: "#e9ebee",
    margin: 1
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 1,
    imageSize: 0.5
  }
});

const svgCode = await qrCode.serialize();

const { width, height } = qrCode.size;
const buffers = [];
const doc = new PDFDocument({ size: [width, height] });
doc.on("data", (v) => buffers.push(v));
const buffer = await new Promise((resolve) => {
  doc.on("end", () => {
    resolve(Buffer.concat(buffers));
  });
  SVGtoPDF(doc, svgCode, 0, 0, {
    width,
    height,
    assumePt: true
  });
  doc.end();
});
await writeFile("qr.pdf", buffer);
```

### Kanji support

For Kanji mode to work, import `stringToBytesFuncs` from `@liquid-js/qr-code-styling/kanji` and inclue it with config.

```js
import { stringToBytesFuncs } from "@liquid-js/qr-code-styling/kanji";

const qrCode = new QRCodeStyling({
  data: "漢字",
  qrOptions: {
    mode: Mode.kanji
  },
  stringToBytesFuncs
  // ...other options
});
```

## License

[MIT License](https://github.com/Liquid-JS/qr-code-styling/blob/master/LICENSE)
