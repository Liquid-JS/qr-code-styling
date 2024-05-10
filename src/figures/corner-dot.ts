import { BasicFigureDrawArgs, DrawArgs, RotateFigureArgs } from "../types/helper.js";
import { CornerDotType } from "../utils/options.js";
import { numToAttr, svgPath } from "../utils/svg.js";

export class QRCornerDot {
  private _element?: SVGElement;

  get element() {
    return this._element;
  }

  constructor(
    private readonly type: `${CornerDotType}`,
    private readonly document: Document
  ) {}

  draw(args: DrawArgs): void {
    const type = this.type;
    let drawFunction;

    switch (type) {
      case CornerDotType.square:
        drawFunction = this.drawSquare;
        break;
      case CornerDotType.heart:
        drawFunction = this.drawHeart;
        break;
      case CornerDotType.extraRounded:
        drawFunction = this.drawRounded;
        break;
      case CornerDotType.classy:
        drawFunction = this.drawClassy;
        break;
      case CornerDotType.inpoint:
        drawFunction = this.drawInpoint;
        break;
      case CornerDotType.outpoint:
        drawFunction = this.drawOutpoint;
        break;
      case CornerDotType.dot:
      default:
        drawFunction = this.drawDot;
    }

    drawFunction.call(this, args);
  }

  private rotateFigure({ x, y, size, rotation = 0, draw }: RotateFigureArgs): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    draw();
    this._element?.setAttribute("transform", `rotate(${numToAttr((180 * rotation) / Math.PI)},${cx},${cy})`);
  }

  private basicDot(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this._element.setAttribute("cx", numToAttr(x + size / 2));
        this._element.setAttribute("cy", numToAttr(y + size / 2));
        this._element.setAttribute("r", numToAttr(size / 2));
      }
    });
  }

  private basicSquare(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", numToAttr(x));
        this._element.setAttribute("y", numToAttr(y));
        this._element.setAttribute("width", numToAttr(size));
        this._element.setAttribute("height", numToAttr(size));
      }
    });
  }

  private basicHeart(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
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
          return numToAttr(v);
        })
        .join(" ")
    );
  }

  private basicRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", numToAttr(x));
        this._element.setAttribute("y", numToAttr(y));
        this._element.setAttribute("width", numToAttr(size));
        this._element.setAttribute("height", numToAttr(size));
        this._element.setAttribute("rx", numToAttr(size / 4));
        this._element.setAttribute("ry", numToAttr(size / 4));
      }
    });
  }

  private basicClassy(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size / 7;
    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          svgPath`M ${x} ${y + 2.5 * dotSize}
          v ${2 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${dotSize * 2.5}
          h ${4.5 * dotSize}
          v ${-4.5 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${-dotSize * 2.5}
          h ${-2 * dotSize}
          H ${x}
          z`
        );
      }
    });
  }

  private basicInpoint(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          svgPath`M ${x} ${y + dotSize / 2}
          v ${dotSize / 4}
          a ${dotSize / 4}, ${dotSize / 4} 0 0 0 ${dotSize / 4}, ${dotSize / 4}
          h ${(dotSize / 4) * 3}
          v ${(-dotSize / 4) * 3}
          a ${dotSize / 4}, ${dotSize / 4} 0 0 0 ${-dotSize / 4}, ${-dotSize / 4}
          h ${-dotSize / 2}
          a ${dotSize / 4}, ${dotSize / 4} 0 0 0 ${-dotSize / 4}, ${dotSize / 4}
          z`
        );
      }
    });
  }

  private drawDot({ x, y, size, rotation }: DrawArgs): void {
    this.basicDot({ x, y, size, rotation });
  }

  private drawSquare({ x, y, size, rotation }: DrawArgs): void {
    this.basicSquare({ x, y, size, rotation });
  }

  private drawHeart({ x, y, size, rotation }: DrawArgs): void {
    const scaleFactor = 0.2;
    this.basicHeart({
      x: x - (scaleFactor * size) / 2,
      y: y - (scaleFactor * size) / 2,
      size: size * (1 + scaleFactor),
      rotation
    });
  }

  private drawRounded({ x, y, size, rotation }: DrawArgs): void {
    this.basicRounded({ x, y, size, rotation });
  }

  private drawClassy({ x, y, size, rotation }: DrawArgs): void {
    this.basicClassy({ x, y, size, rotation });
  }

  private drawInpoint({ x, y, size, rotation }: DrawArgs): void {
    this.basicInpoint({ x, y, size, rotation });
  }

  private drawOutpoint({ x, y, size, rotation }: DrawArgs): void {
    this.basicInpoint({ x, y, size, rotation: (rotation || 0) + Math.PI });
  }
}
