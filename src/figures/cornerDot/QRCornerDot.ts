import { BasicFigureDrawArgs, CornerDotType, DrawArgs, RotateFigureArgs } from "../../types";

export class QRCornerDot {
  _element?: SVGElement;
  _svg: SVGElement;
  _type: CornerDotType;
  _document: Document;

  constructor({ svg, type, document }: { svg: SVGElement; type: CornerDotType; document: Document }) {
    this._svg = svg;
    this._type = type;
    this._document = document;
  }

  draw(x: number, y: number, size: number, rotation: number): void {
    const type = this._type;
    let drawFunction;

    switch (type) {
      case CornerDotType.square:
        drawFunction = this._drawSquare;
        break;
      case CornerDotType.heart:
        drawFunction = this._drawHeart;
        break;
      case CornerDotType.extraRounded:
        drawFunction = this._drawRounded;
        break;
      case CornerDotType.classy:
        drawFunction = this._drawClassy;
        break;
      case CornerDotType.inpoint:
        drawFunction = this._drawInpoint;
        break;
      case CornerDotType.outpoint:
        drawFunction = this._drawOutpoint;
        break;
      case CornerDotType.dot:
      default:
        drawFunction = this._drawDot;
    }

    drawFunction.call(this, { x, y, size, rotation });
  }

  _rotateFigure({ x, y, size, rotation = 0, draw }: RotateFigureArgs): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    draw();
    this._element?.setAttribute("transform", `rotate(${(180 * rotation) / Math.PI},${cx},${cy})`);
  }

  _basicDot(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this._element.setAttribute("cx", String(x + size / 2));
        this._element.setAttribute("cy", String(y + size / 2));
        this._element.setAttribute("r", String(size / 2));
      }
    });
  }

  _basicSquare(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(x));
        this._element.setAttribute("y", String(y));
        this._element.setAttribute("width", String(size));
        this._element.setAttribute("height", String(size));
      }
    });
  }

  _basicHeart(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._element = this._document.createElementNS("http://www.w3.org/2000/svg", "path");
    const path = [
      "M",
      0.925,
      0.3538125,
      "c",
      0,
      0.0325869,
      -0.0054931,
      0.0644619,
      -0.0164688,
      0.095625,
      "S",
      0.87825,
      0.5147812,
      0.850625,
      0.5519688,
      "C",
      0.823,
      0.5891563,
      0.7858125,
      0.631125,
      0.7390625,
      0.677875,
      "S",
      0.6331632,
      0.7802256,
      0.561625,
      0.8446875,
      "L",
      0.5,
      0.8999375,
      "l",
      -0.061625,
      -0.05525,
      "C",
      0.3668368,
      0.7802256,
      0.3076875,
      0.724625,
      0.2609375,
      0.677875,
      "S",
      0.177,
      0.5891563,
      0.149375,
      0.5519688,
      "S",
      0.1024444,
      0.4806007,
      0.0914688,
      0.4494375,
      "S",
      0.075,
      0.3863994,
      0.075,
      0.3538125,
      "C",
      0.075,
      0.2872256,
      0.0973125,
      0.231625,
      0.1419375,
      0.187,
      "S",
      0.2421631,
      0.1200625,
      0.30875,
      0.1200625,
      "c",
      0.0368369,
      0,
      0.0718994,
      0.0077881,
      0.1051875,
      0.023375,
      "S",
      0.4759131,
      0.1809756,
      0.5,
      0.2093125,
      "c",
      0.0240868,
      -0.0283369,
      0.0527744,
      -0.0502881,
      0.0860625,
      -0.065875,
      "c",
      0.0332882,
      -0.0155869,
      0.0683507,
      -0.023375,
      0.1051875,
      -0.023375,
      "c",
      0.0665869,
      0,
      0.1221875,
      0.0223125,
      0.1668125,
      0.0669375,
      "S",
      0.925,
      0.2872256,
      0.925,
      0.3538125,
      "z"
    ];
    let move = false;
    let i = 0;
    this._element.setAttribute(
      "d",
      path
        .map((v) => {
          if (typeof v == "string") {
            i = 0;
            move = v.toUpperCase() == v;
            return v;
          }
          i++;
          v = v * size;
          if (move) {
            v += i % 2 == 1 ? x : y;
          }
          return v.toFixed(5);
        })
        .join(" ")
    );
  }

  _basicRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(x));
        this._element.setAttribute("y", String(y));
        this._element.setAttribute("width", String(size));
        this._element.setAttribute("height", String(size));
        this._element.setAttribute("rx", String(size / 4));
        this._element.setAttribute("ry", String(size / 4));
      }
    });
  }

  _basicClassy(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size / 7;
    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          `M ${x} ${y + 2.5 * dotSize}` +
            `v ${2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${dotSize * 2.5}` +
            `h ${4.5 * dotSize}` +
            `v ${-4.5 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${-dotSize * 2.5}` +
            `h ${-2 * dotSize}` +
            `H ${x}` +
            `z`
        );
      }
    });
  }

  _basicInpoint(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          `M ${x} ${y + dotSize / 2}` +
            `v ${dotSize / 4}` +
            `a ${dotSize / 4}, ${dotSize / 4} 0 0 0 ${dotSize / 4}, ${dotSize / 4}` +
            `h ${(dotSize / 4) * 3}` +
            `v ${(-dotSize / 4) * 3}` +
            `a ${dotSize / 4}, ${dotSize / 4} 0 0 0 ${-dotSize / 4}, ${-dotSize / 4}` +
            `h ${-dotSize / 2}` +
            `a ${dotSize / 4}, ${dotSize / 4} 0 0 0 ${-dotSize / 4}, ${dotSize / 4}` +
            `z`
        );
      }
    });
  }

  _drawDot({ x, y, size, rotation }: DrawArgs): void {
    this._basicDot({ x, y, size, rotation });
  }

  _drawSquare({ x, y, size, rotation }: DrawArgs): void {
    this._basicSquare({ x, y, size, rotation });
  }

  _drawHeart({ x, y, size, rotation }: DrawArgs): void {
    const scaleFactor = 0.2;
    this._basicHeart({
      x: x - (scaleFactor * size) / 2,
      y: y - (scaleFactor * size) / 2,
      size: size * (1 + scaleFactor),
      rotation
    });
  }

  _drawRounded({ x, y, size, rotation }: DrawArgs): void {
    this._basicRounded({ x, y, size, rotation });
  }

  _drawClassy({ x, y, size, rotation }: DrawArgs): void {
    this._basicClassy({ x, y, size, rotation });
  }

  _drawInpoint({ x, y, size, rotation }: DrawArgs): void {
    this._basicInpoint({ x, y, size, rotation });
  }

  _drawOutpoint({ x, y, size, rotation }: DrawArgs): void {
    this._basicInpoint({ x, y, size, rotation: (rotation || 0) + Math.PI });
  }
}
