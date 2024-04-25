# QR Code Styling

[![Version](https://img.shields.io/npm/v/@liquid-js/qr-code-styling.svg)](https://www.npmjs.org/package/@liquid-js/qr-code-styling)

JavaScript library for generating QR codes with a logo and styling.

Try it here <https://qr-code-styling.com>

If you have issues / suggestions / notes / questions, please open an issue or contact me. Let's create a cool library together.

### Examples

<p float="left">
<img style="display:inline-block" src="https://raw.githubusercontent.com/Liquid-JS/qr-code-styling/master/src/assets/facebook.png" width="240" />
<img style="display:inline-block" src="https://raw.githubusercontent.com/Liquid-JS/qr-code-styling/master/src/assets/qr-styling.png" width="240" />
<img style="display:inline-block" src="https://raw.githubusercontent.com/Liquid-JS/qr-code-styling/master/src/assets/telegram.png" width="240" />
</p>

### Installation

    npm install @liquid-js/qr-code-styling

### Usage

#### Browser

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
          imageSize: 0.9
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

#### Node

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
    imageSize: 0.9
  }
});

const svgCode = await qrCode.serialize();

const width = parseFloat(qrCode._svg.getAttribute("width"));
const height = parseFloat(qrCode._svg.getAttribute("height"));
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

### API Documentation

#### QRCodeStyling instance

```js
new QRCodeStyling(options) => QRCodeStyling
```

| Param   | Type   | Description |
| ------- | ------ | ----------- |
| options | object | Init object |

`options` structure

| Property             | Type              | Default Value | Description                                                |
| -------------------- | ----------------- | ------------- | ---------------------------------------------------------- |
| data                 | string            |               | The date will be encoded to the QR code                    |
| image                | string \| Blob    |               | The image will be copied to the center of the QR code      |
| shape                | string            | `'square'`    | QR code shape                                              |
| qrOptions            | object            |               | Options will be passed to `qrcode-generator` lib           |
| imageOptions         | object            |               | Specific image options, details see below                  |
| dotsOptions          | object            |               | Dots styling options                                       |
| cornersSquareOptions | object            |               | Square in the corners styling options                      |
| cornersDotOptions    | object            |               | Dots in the corners styling options                        |
| backgroundOptions    | object \| boolean | `false`       | QR background styling options, false to disable background |

`options.qrOptions` structure

| Property             | Type                                               | Default Value |
| -------------------- | -------------------------------------------------- | ------------- |
| typeNumber           | number (`0 - 40`)                                  | `0`           |
| mode                 | string (`'Numeric' 'Alphanumeric' 'Byte' 'Kanji'`) |               |
| errorCorrectionLevel | string (`'L' 'M' 'Q' 'H'`)                         | `'Q'`         |

`options.imageOptions` structure

| Property           | Type                                     | Default Value | Description                                                         |
| ------------------ | ---------------------------------------- | ------------- | ------------------------------------------------------------------- |
| hideBackgroundDots | boolean                                  | `true`        | Hide all dots covered by the image                                  |
| imageSize          | number                                   | `0.4`         | Coefficient of the image size                                       |
| margin             | number                                   | `0`           | Margin of the image (in blocks)                                     |
| crossOrigin        | string (`'anonymous' 'use-credentials'`) |               | Set "anonymous" if you want to download QR code from other origins. |

`options.dotsOptions` structure

| Property | Type                                                                           | Default Value | Description             |
| -------- | ------------------------------------------------------------------------------ | ------------- | ----------------------- |
| size     | number                                                                         | `10`          | QR dot size (in pixels) |
| color    | string                                                                         | `'#000'`      | Color of QR dots        |
| gradient | object                                                                         |               | Gradient of QR dots     |
| type     | string (`'rounded' 'dots' 'classy' 'classy-rounded' 'square' 'extra-rounded'`) | `'square'`    | Style of QR dots        |

`options.cornersSquareOptions` structure

| Property | Type                                      | Default Value | Description                |
| -------- | ----------------------------------------- | ------------- | -------------------------- |
| color    | string                                    |               | Color of Corners Square    |
| gradient | object                                    |               | Gradient of Corners Square |
| type     | string (`'dot' 'square' 'extra-rounded'`) |               | Style of Corners Square    |

`options.cornersDotOptions` structure

| Property | Type                      | Default Value | Description             |
| -------- | ------------------------- | ------------- | ----------------------- |
| color    | string                    |               | Color of Corners Dot    |
| gradient | object                    |               | Gradient of Corners Dot |
| type     | string (`'dot' 'square'`) |               | Style of Corners Dot    |

`options.backgroundOptions` structure

| Property | Type             | Default Value | Description                                           |
| -------- | ---------------- | ------------- | ----------------------------------------------------- |
| round    | number (`0 - 1`) | `0`           | Background roundnes                                   |
| color    | string           |               |                                                       |
| gradient | object           |               |                                                       |
| margin   | number           | `0`           | Margin (in blocks) between background and the QR code |

Gradient structure

`options.dotsOptions.gradient`

`options.backgroundOptions.gradient`

`options.cornersSquareOptions.gradient`

`options.cornersDotOptions.gradient`

| Property   | Type                         | Default Value | Description                                                                             |
| ---------- | ---------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| type       | string (`'linear' 'radial'`) | `'linear'`    | Type of gradient spread                                                                 |
| rotation   | number                       | 0             | Rotation of gradient in radians (Math.PI === 180 degrees)                               |
| colorStops | array of objects             |               | Gradient colors. Example `[{ offset: 0, color: 'blue' }, {  offset: 1, color: 'red' }]` |

Gradient colorStops structure

`options.dotsOptions.gradient.colorStops[]`

`options.backgroundOptions.gradient.colorStops[]`

`options.cornersSquareOptions.gradient.colorStops[]`

`options.cornersDotOptions.gradient.colorStops[]`

| Property | Type             | Default Value | Description                         |
| -------- | ---------------- | ------------- | ----------------------------------- |
| offset   | number (`0 - 1`) |               | Position of color in gradient range |
| color    | string           |               | Color of stop in gradient range     |

#### QRCodeStyling methods

```js
QRCodeStyling.append(container) => void
```

| Param     | Type        | Description                                              |
| --------- | ----------- | -------------------------------------------------------- |
| container | DOM element | This container will be used for appending of the QR code |

```js
QRCodeStyling.serialize() => Promise<string>
```

```js
QRCodeStyling.update(options) => void
```

| Param   | Type   | Description                            |
| ------- | ------ | -------------------------------------- |
| options | object | The same options as for initialization |

```js
QRCodeStyling.applyExtension(extension) => void
```

| Param     | Type                   | Description                                                                               |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| extension | (svg, options) => void | Extension is a function that takes svg and previously applied options and modifies an svg |

`applyExtension` example

```js
const extension = (svg, options) => {
  const { width, height, document } = options;
  const size = Math.min(width, height);
  const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  const borderAttributes = {
    fill: "none",
    x: (width - size + 40) / 2,
    y: (height - size + 40) / 2,
    width: size - 40,
    height: size - 40,
    stroke: "black",
    "stroke-width": 40,
    rx: 100
  };
  Object.keys(borderAttributes).forEach((attribute) => {
    border.setAttribute(attribute, borderAttributes[attribute]);
  });
  svg.appendChild(border);
};
```

```js
QRCodeStyling.deleteExtension() => void
```

### License

[MIT License](https://github.com/Liquid-JS/qr-code-styling/blob/master/LICENSE)
