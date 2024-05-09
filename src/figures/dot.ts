import { BasicFigureDrawArgs, DrawArgs, RotateFigureArgs } from "../types/helper.js";
import { DotType } from "../utils/options.js";

export class QRDot {
  private _element?: SVGElement;

  get element() {
    return this._element;
  }

  constructor(
    private readonly type: `${DotType}`,
    private readonly document: Document
  ) {}

  draw(args: DrawArgs): void {
    const type = this.type;
    let drawFunction;

    switch (type) {
      case DotType.dot:
        drawFunction = this.drawDot;
        break;
      case DotType.randomDot:
        drawFunction = this.drawRandomDot;
        break;
      case DotType.classy:
        drawFunction = this.drawClassy;
        break;
      case DotType.classyRounded:
        drawFunction = this.drawClassyRounded;
        break;
      case DotType.rounded:
        drawFunction = this.drawRounded;
        break;
      case DotType.verticalLine:
        drawFunction = this.drawVerticalLine;
        break;
      case DotType.horizontalLine:
        drawFunction = this.drawHorizontalLine;
        break;
      case DotType.extraRounded:
        drawFunction = this.drawExtraRounded;
        break;
      case DotType.diamond:
        drawFunction = this.drawDiamond;
        break;
      case DotType.smallSquare:
        drawFunction = this.drawSmallSquare;
        break;
      case DotType.square:
      default:
        drawFunction = this.drawSquare;
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

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this._element.setAttribute("cx", String(x + size / 2));
        this._element.setAttribute("cy", String(y + size / 2));
        this._element.setAttribute("r", String(size / 2));
      }
    });
  }

  private basicSquare(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(x));
        this._element.setAttribute("y", String(y));
        this._element.setAttribute("width", String(size));
        this._element.setAttribute("height", String(size));
      }
    });
  }

  //if rotation === 0 - right side is rounded
  private basicSideRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` + //go to top left position
            `v ${size}` + //draw line to left bottom corner
            `h ${size / 2}` + //draw line to left bottom corner + half of size right
            `a ${size / 2} ${size / 2}, 0, 0, 0, 0 ${-size}` // draw rounded corner
        );
      }
    });
  }

  //if rotation === 0 - top right corner is rounded
  private basicCornerRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` + //go to top left position
            `v ${size}` + //draw line to left bottom corner
            `h ${size}` + //draw line to right bottom corner
            `v ${-size / 2}` + //draw line to right bottom corner + half of size top
            `a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}` // draw rounded corner
        );
      }
    });
  }

  //if rotation === 0 - top right corner is rounded
  private basicCornerExtraRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` + //go to top left position
            `v ${size}` + //draw line to left bottom corner
            `h ${size}` + //draw line to right bottom corner
            `a ${size} ${size}, 0, 0, 0, ${-size} ${-size}` // draw rounded top right corner
        );
      }
    });
  }

  //if rotation === 0 - left bottom and right top corners are rounded
  private basicCornersRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;

    this.rotateFigure({
      ...args,
      draw: () => {
        this._element = this.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${x} ${y}` + //go to left top position
            `v ${size / 2}` + //draw line to left top corner + half of size bottom
            `a ${size / 2} ${size / 2}, 0, 0, 0, ${size / 2} ${size / 2}` + // draw rounded left bottom corner
            `h ${size / 2}` + //draw line to right bottom corner
            `v ${-size / 2}` + //draw line to right bottom corner + half of size top
            `a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}` // draw rounded right top corner
        );
      }
    });
  }

  private drawDot({ x, y, size }: DrawArgs): void {
    this.basicDot({ x, y, size, rotation: 0 });
  }

  private drawRandomDot({ x, y, size }: DrawArgs): void {
    const randomFactor = Math.random() * (1 - 0.75) + 0.75;
    this.basicDot({ x, y, size: size * randomFactor, rotation: 0 });
  }

  private drawSquare({ x, y, size }: DrawArgs): void {
    this.basicSquare({ x, y, size, rotation: 0 });
  }

  private drawSmallSquare({ x, y, size }: DrawArgs): void {
    const originalSize = size;

    size = originalSize * 0.7;
    x = x + originalSize * 0.15;
    y = y + originalSize * 0.15;

    this.basicSquare({ x, y, size, rotation: 0 });
  }

  private drawDiamond({ x, y, size }: DrawArgs): void {
    this.basicSquare({ x, y, size, rotation: Math.PI / 4 });
  }

  private drawRounded({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this.basicDot({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
      this.basicSquare({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount === 2) {
      let rotation = 0;

      if (leftNeighbor && topNeighbor) {
        rotation = Math.PI / 2;
      } else if (topNeighbor && rightNeighbor) {
        rotation = Math.PI;
      } else if (rightNeighbor && bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this.basicCornerRounded({ x, y, size, rotation });
      return;
    }

    if (neighborsCount === 1) {
      let rotation = 0;

      if (topNeighbor) {
        rotation = Math.PI / 2;
      } else if (rightNeighbor) {
        rotation = Math.PI;
      } else if (bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this.basicSideRounded({ x, y, size, rotation });
      return;
    }
  }

  private drawVerticalLine({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (
      neighborsCount === 0 ||
      (leftNeighbor && !(topNeighbor || bottomNeighbor)) ||
      (rightNeighbor && !(topNeighbor || bottomNeighbor))
    ) {
      this.basicDot({ x, y, size, rotation: 0 });
      return;
    }

    if (topNeighbor && bottomNeighbor) {
      this.basicSquare({ x, y, size, rotation: 0 });
      return;
    }

    if (topNeighbor && !bottomNeighbor) {
      const rotation = Math.PI / 2;
      this.basicSideRounded({ x, y, size, rotation });
      return;
    }

    if (bottomNeighbor && !topNeighbor) {
      const rotation = -Math.PI / 2;
      this.basicSideRounded({ x, y, size, rotation });
      return;
    }
  }

  private drawHorizontalLine({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (
      neighborsCount === 0 ||
      (topNeighbor && !(leftNeighbor || rightNeighbor)) ||
      (bottomNeighbor && !(leftNeighbor || rightNeighbor))
    ) {
      this.basicDot({ x, y, size, rotation: 0 });
      return;
    }

    if (leftNeighbor && rightNeighbor) {
      this.basicSquare({ x, y, size, rotation: 0 });
      return;
    }

    if (leftNeighbor && !rightNeighbor) {
      const rotation = 0;
      this.basicSideRounded({ x, y, size, rotation });
      return;
    }

    if (rightNeighbor && !leftNeighbor) {
      const rotation = Math.PI;
      this.basicSideRounded({ x, y, size, rotation });
      return;
    }
  }

  private drawExtraRounded({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this.basicDot({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
      this.basicSquare({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount === 2) {
      let rotation = 0;

      if (leftNeighbor && topNeighbor) {
        rotation = Math.PI / 2;
      } else if (topNeighbor && rightNeighbor) {
        rotation = Math.PI;
      } else if (rightNeighbor && bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this.basicCornerExtraRounded({ x, y, size, rotation });
      return;
    }

    if (neighborsCount === 1) {
      let rotation = 0;

      if (topNeighbor) {
        rotation = Math.PI / 2;
      } else if (rightNeighbor) {
        rotation = Math.PI;
      } else if (bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this.basicSideRounded({ x, y, size, rotation });
      return;
    }
  }

  private drawClassy({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this.basicCornersRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    if (!leftNeighbor && !topNeighbor) {
      this.basicCornerRounded({ x, y, size, rotation: -Math.PI / 2 });
      return;
    }

    if (!rightNeighbor && !bottomNeighbor) {
      this.basicCornerRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    this.basicSquare({ x, y, size, rotation: 0 });
  }

  private drawClassyRounded({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this.basicCornersRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    if (!leftNeighbor && !topNeighbor) {
      this.basicCornerExtraRounded({ x, y, size, rotation: -Math.PI / 2 });
      return;
    }

    if (!rightNeighbor && !bottomNeighbor) {
      this.basicCornerExtraRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    this.basicSquare({ x, y, size, rotation: 0 });
  }
}
