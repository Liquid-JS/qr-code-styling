# QR Code Styling

[![Version](https://img.shields.io/npm/v/@liquid-js/qr-code-styling.svg)](https://www.npmjs.org/package/@liquid-js/qr-code-styling)

JavaScript library for generating QR codes with a logo and styling.

Try it here <https://qr-code-styling.com>

If you have issues / suggestions / notes / questions, please open an issue or contact me. Let's create a cool library together.

### Examples

<p float="left">
<img style="display:inline-block" src="https://raw.githubusercontent.com/kozakdenys/qr-code-styling/master/src/assets/facebook_example_new.png" width="240" />
<img style="display:inline-block" src="https://raw.githubusercontent.com/kozakdenys/qr-code-styling/master/src/assets/qr_code_example.png" width="240" />
<img style="display:inline-block" src="https://raw.githubusercontent.com/kozakdenys/qr-code-styling/master/src/assets/telegram_example_new.png" width="240" />
</p>

### Installation

    npm install qr-code-styling

### Usage

```HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>QR Code Styling</title>
  </head>
  <body>
    <div id="canvas"></div>
    <script type="module">
      import { QRCodeStyling } from "https://unpkg.com/@liquid-js/qr-code-styling@2.0.2/lib/qr-code-styling.js";

      const options = {
        shape: "circle",
        type: "svg",
        data: "h",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
        dotsOptions: {
          type: "extra-rounded",
          gradient: {
            type: "linear", //radial,
            rotation: Math.PI / 2,
            colorStops: [
              { offset: 0, color: "blue" },
              { offset: 0.5, color: "red" },
              { offset: 1, color: "green" }
            ]
          }
        },
        cornersSquareOptions: {
          type: "rounded",
          gradient: {
            type: "linear",
            rotation: Math.PI * 0.2,
            colorStops: [
              {
                offset: 0,
                color: "blue"
              },
              {
                offset: 1,
                color: "red"
              }
            ]
          }
        },
        imageOptions: {
          crossOrigin: "anonymous",
          imageSize: 1,
          margin: 1
        }
      };
      const qrCode = new QRCodeStyling(options);

      qrCode.append(document.getElementById("canvas"));
    </script>
  </body>
</html>
```

### API Documentation

#### QRCodeStyling instance

`new QRCodeStyling(options) => QRCodeStyling`

| Param   | Type   | Description |
| ------- | ------ | ----------- |
| options | object | Init object |

`options` structure

| Property                | Type   | Default Value | Description                                           |
| ----------------------- | ------ | ------------- | ----------------------------------------------------- |
| data                    | string |               | The date will be encoded to the QR code               |
| image                   | string |               | The image will be copied to the center of the QR code |
| qrOptions               | object |               | Options will be passed to `qrcode-generator` lib      |
| imageOptions            | object |               | Specific image options, details see below             |
| dotsOptions             | object |               | Dots styling options                                  |
| cornersSquareOptions    | object |               | Square in the corners styling options                 |
| cornersDotOptionsHelper | object |               | Dots in the corners styling options                   |
| backgroundOptions       | object |               | QR background styling options                         |

`options.qrOptions` structure

| Property             | Type                                               | Default Value |
| -------------------- | -------------------------------------------------- | ------------- |
| typeNumber           | number (`0 - 40`)                                  | `0`           |
| mode                 | string (`'Numeric' 'Alphanumeric' 'Byte' 'Kanji'`) |               |
| errorCorrectionLevel | string (`'L' 'M' 'Q' 'H'`)                         | `'Q'`         |

`options.imageOptions` structure

| Property           | Type                                    | Default Value | Description                                                                    |
| ------------------ | --------------------------------------- | ------------- | ------------------------------------------------------------------------------ |
| hideBackgroundDots | boolean                                 | `true`        | Hide all dots covered by the image                                             |
| imageSize          | number                                  | `0.4`         | Coefficient of the image size. Not recommended to use ove 0.5. Lower is better |
| margin             | number                                  | `0`           | Margin of the image in blocks                                                  |
| crossOrigin        | string(`'anonymous' 'use-credentials'`) |               | Set "anonymous" if you want to download QR code from other origins.            |

`options.dotsOptions` structure

| Property | Type                                                                           | Default Value | Description         |
| -------- | ------------------------------------------------------------------------------ | ------------- | ------------------- |
| color    | string                                                                         | `'#000'`      | Color of QR dots    |
| gradient | object                                                                         |               | Gradient of QR dots |
| type     | string (`'rounded' 'dots' 'classy' 'classy-rounded' 'square' 'extra-rounded'`) | `'square'`    | Style of QR dots    |

`options.backgroundOptions` structure

| Property | Type   | Default Value |
| -------- | ------ | ------------- |
| color    | string | `'#fff'`      |
| gradient | object |               |

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

Gradient structure

`options.dotsOptions.gradient`

`options.backgroundOptions.gradient`

`options.cornersSquareOptions.gradient`

`options.cornersDotOptions.gradient`

| Property   | Type                         | Default Value | Description                                                                             |
| ---------- | ---------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| type       | string (`'linear' 'radial'`) | "linear"      | Type of gradient spread                                                                 |
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

`QRCodeStyling.append(container) => void`

| Param     | Type        | Description                                              |
| --------- | ----------- | -------------------------------------------------------- |
| container | DOM element | This container will be used for appending of the QR code |

`QRCodeStyling.serialize() => Promise<string>`

`QRCodeStyling.update(options) => void`

| Param   | Type   | Description                            |
| ------- | ------ | -------------------------------------- |
| options | object | The same options as for initialization |

`QRCodeStyling.applyExtension(extension) => void`

| Param     | Type                   | Description                                                                               |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| extension | (svg, options) => void | Extension is a function that takes svg and previously applied options and modifies an svg |

`applyExtension` example

```js
const extension = (svg, options) => {
  const { width, height } = options;
  const size = Math.min(width, height);
  const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  const borderAttributes = {
    "fill": "none",
    "x": (width - size + 40) / 2,
    "y": (height - size + 40) / 2,
    "width": size - 40,
    "height": size - 40,
    "stroke": 'black',
    "stroke-width": 40,
    "rx": 100,
  };
  Object.keys(borderAttributes).forEach(attribute => {
    border.setAttribute(attribute, borderAttributes[attribute]);
  });
  svg.appendChild(border);
};
```

```js
QRCodeStyling.deleteExtension() => void
```

### License

[MIT License](https://github.com/Liquid-JS/qr-code-styling/blob/master/LICENSE). Copyright (c) 2021 Denys Kozak
