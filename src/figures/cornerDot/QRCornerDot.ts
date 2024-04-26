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
      0.3569803,
      "c",
      0,
      0.0339813,
      -0.0085083,
      0.0595062,
      -0.0170166,
      0.0934875,
      "C",
      0.8994751,
      0.484501,
      0.8740021,
      0.5184824,
      0.8484772,
      0.5524637,
      "C",
      0.8230041,
      0.5950052,
      0.7890228,
      0.6374948,
      0.7380249,
      0.6799845,
      "C",
      0.6954834,
      0.7309824,
      0.6359771,
      0.7819803,
      0.5595062,
      0.8499948,
      "L",
      0.5,
      0.9009928,
      "L",
      0.4404938,
      0.8499948,
      "C",
      0.3640228,
      0.7819803,
      0.3045166,
      0.7309824,
      0.2619751,
      0.6799845,
      "C",
      0.2109772,
      0.6374948,
      0.1769958,
      0.5950052,
      0.1515228,
      0.5524637,
      "C",
      0.1174896,
      0.5184824,
      0.1005249,
      0.484501,
      0.0920166,
      0.4504678,
      "C",
      0.0835083,
      0.4164865,
      0.075,
      0.3909616,
      0.075,
      0.3569803,
      "c",
      0,
      -0.0680145,
      0.0255249,
      -0.1190125,
      0.0680145,
      -0.1700104,
      "c",
      0.0424896,
      -0.0424896,
      0.1019959,
      -0.0679626,
      0.1700104,
      -0.0679626,
      "c",
      0.0339813,
      0,
      0.0679626,
      0.0084564,
      0.1019959,
      0.025473,
      "C",
      0.4490021,
      0.1614969,
      0.4744751,
      0.1869699,
      0.5,
      0.2124948,
      "c",
      0.0255249,
      -0.0255249,
      0.0509979,
      -0.0509979,
      0.0849792,
      -0.0680145,
      "c",
      0.0340332,
      -0.0170166,
      0.0680146,
      -0.025473,
      0.1105042,
      -0.025473,
      "c",
      0.0595062,
      0,
      0.1190125,
      0.025473,
      0.1615021,
      0.0679626,
      "C",
      0.8994751,
      0.2379678,
      0.925,
      0.2889658,
      0.925,
      0.3569803,
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

  _basicOutpoint(args: BasicFigureDrawArgs): void {
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
            `h ${dotSize / 2}` +
            `a ${dotSize / 4}, ${dotSize / 4} 0 0 0 ${dotSize / 4}, ${-dotSize / 4}` +
            `v ${-dotSize / 2}` +
            `a ${dotSize / 4}, ${dotSize / 4} 0 0 0 ${-dotSize / 4}, ${-dotSize / 4}` +
            `h ${(-dotSize / 4) * 3}` +
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
    this._basicOutpoint({ x, y, size, rotation });
  }
}
