import { BasicFigureDrawArgs, DrawArgs, RotateFigureArgs } from "../types/helper.js";
import { CornerSquareType } from "../utils/options.js";

export class QRCornerSquare {
  private _element?: SVGElement;

  get element() {
    return this._element;
  }

  constructor(
    private readonly type: `${CornerSquareType}`,
    private readonly document: Document
  ) {}

  draw(args: DrawArgs): void {
    const type = this.type;
    let drawFunction;

    switch (type) {
      case CornerSquareType.square:
        drawFunction = this.drawSquare;
        break;
      case CornerSquareType.extraRounded:
        drawFunction = this.drawExtraRounded;
        break;
      case CornerSquareType.classy:
        drawFunction = this.drawClassy;
        break;
      case CornerSquareType.outpoint:
        drawFunction = this.drawOutpoint;
        break;
      case CornerSquareType.inpoint:
        drawFunction = this.drawInpoint;
        break;
      case CornerSquareType.dot:
      default:
        drawFunction = this.drawDot;
    }

    drawFunction.call(this, args);
  }

  private rotateFigure({ x, y, size, rotation = 0, draw }: RotateFigureArgs): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    draw();
    this._element?.setAttribute("transform", `rotate(${(180 * rotation) / Math.PI},${cx},${cy})`);
  }

  private basicDot(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size / 7;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          `M ${x + size / 2} ${y}` + // M cx, y //  Move to top of ring
            `a ${size / 2} ${size / 2} 0 1 0 0.1 0` + // a outerRadius, outerRadius, 0, 1, 0, 1, 0 // Draw outer arc, but don't close it
            `z` + // Z // Close the outer shape
            `m 0 ${dotSize}` + // m -1 outerRadius-innerRadius // Move to top point of inner radius
            `a ${size / 2 - dotSize} ${size / 2 - dotSize} 0 1 1 -0.1 0` + // a innerRadius, innerRadius, 0, 1, 1, -1, 0 // Draw inner arc, but don't close it
            `Z` // Z // Close the inner ring. Actually will still work without, but inner ring will have one unit missing in stroke
        );
      }
    });
  }

  private basicSquare(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size / 7;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` +
            `v ${size}` +
            `h ${size}` +
            `v ${-size}` +
            `z` +
            `M ${x + dotSize} ${y + dotSize}` +
            `h ${size - 2 * dotSize}` +
            `v ${size - 2 * dotSize}` +
            `h ${-size + 2 * dotSize}` +
            `z`
        );
      }
    });
  }

  private basicExtraRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size / 7;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute("clip-rule", "evenodd");
        this._element.setAttribute(
          "d",
          `M ${x} ${y + 2.5 * dotSize}` +
            `v ${2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${dotSize * 2.5}` +
            `h ${2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${-dotSize * 2.5}` +
            `v ${-2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${-dotSize * 2.5}` +
            `h ${-2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${dotSize * 2.5}` +
            `z` +
            `M ${x + 2.5 * dotSize} ${y + dotSize}` +
            `h ${2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${dotSize * 1.5} ${dotSize * 1.5}` +
            `v ${2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${-dotSize * 1.5} ${dotSize * 1.5}` +
            `h ${-2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${-dotSize * 1.5} ${-dotSize * 1.5}` +
            `v ${-2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${dotSize * 1.5} ${-dotSize * 1.5}` +
            `z`
        );
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
          `M ${x} ${y + 2.5 * dotSize}` +
            `v ${2 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${dotSize * 2.5}` +
            `h ${4.5 * dotSize}` +
            `v ${-4.5 * dotSize}` +
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${-dotSize * 2.5}` +
            `h ${-2 * dotSize}` +
            `H ${x}` +
            `z` +
            `M ${x + 2.5 * dotSize} ${y + dotSize}` +
            `h ${2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${dotSize * 1.5} ${dotSize * 1.5}` +
            `v ${3.5 * dotSize}` +
            `h ${-3.5 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${-dotSize * 1.5} ${-dotSize * 1.5}` +
            `v ${-3.5 * dotSize}` +
            `z`
        );
      }
    });
  }

  private basicInpoint(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const dotSize = size / 7;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
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
            `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${dotSize * 2.5}` +
            "z" +
            `M ${x + 2.5 * dotSize} ${y + dotSize}` +
            `h ${2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${dotSize * 1.5} ${dotSize * 1.5}` +
            `v ${3.5 * dotSize}` +
            `h ${-3.5 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${-dotSize * 1.5} ${-dotSize * 1.5}` +
            `v ${-2 * dotSize}` +
            `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${dotSize * 1.5} ${-dotSize * 1.5}` +
            `z`
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

  private drawExtraRounded({ x, y, size, rotation }: DrawArgs): void {
    this.basicExtraRounded({ x, y, size, rotation });
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
