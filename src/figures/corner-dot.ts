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
      1,
      0.3262506,
      "c",
      0,
      0.0383376,
      -0.0064626,
      0.0758377,
      -0.0193751,
      0.1125001,
      "s",
      -0.0356247,
      0.076875,
      -0.0681248,
      0.1206252,
      "c",
      -0.0325,
      0.0437499,
      -0.0762503,
      0.0931247,
      -0.1312501,
      0.1481249,
      "C",
      0.7262502,
      0.7625008,
      0.6566626,
      0.8279132,
      0.5724999,
      0.9037505,
      "L",
      0.5,
      0.9687506,
      "L",
      0.4275001,
      0.9037505,
      "C",
      0.3433374,
      0.8279132,
      0.2737499,
      0.7625005,
      0.21875,
      0.7075007,
      "C",
      0.1637501,
      0.6525008,
      0.1199999,
      0.6031258,
      0.0874999,
      0.5593758,
      "S",
      0.0322876,
      0.4754133,
      0.0193751,
      0.4387506,
      "S",
      0,
      0.3645881,
      0,
      0.3262506,
      "c",
      0,
      -0.0783374,
      0.0262499,
      -0.1437498,
      0.07875,
      -0.1962499,
      "s",
      0.1179124,
      -0.07875,
      0.1962499,
      -0.07875,
      "c",
      0.0433376,
      0,
      0.0845875,
      0.0091625,
      0.12375,
      0.0274999,
      "S",
      0.4716623,
      0.1229131,
      0.5,
      0.1562506,
      "c",
      0.0283374,
      -0.0333375,
      0.0620874,
      -0.0591625,
      0.1012502,
      -0.0775,
      "c",
      0.0391627,
      -0.0183375,
      0.0804126,
      -0.0274999,
      0.12375,
      -0.0274999,
      "c",
      0.0783374,
      0,
      0.1437497,
      0.0262499,
      0.1962501,
      0.07875,
      "S",
      1,
      0.2479131,
      1,
      0.3262506,
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
    this.basicHeart({ x, y, size, rotation });
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
