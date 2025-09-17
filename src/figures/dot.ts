import { BasicFigureDrawArgs, DrawArgs, RotateFigureArgs } from '../types/helper.js'
import { DotType } from '../utils/options.js'
import { numToAttr, svgPath } from '../utils/svg.js'

export class QRDot {
    private _element?: SVGElement

    get element() {
        return this._element
    }

    constructor(
        private readonly type: `${DotType}`,
        private readonly document: Document
    ) {}

    draw(args: DrawArgs): void {
        const type = this.type
        let drawFunction

        switch (type) {
            case DotType.dot:
                drawFunction = this.drawDot
                break
            case DotType.randomDot:
                drawFunction = this.drawRandomDot
                break
            case DotType.classy:
                drawFunction = this.drawClassy
                break
            case DotType.classyRounded:
                drawFunction = this.drawClassyRounded
                break
            case DotType.rounded:
                drawFunction = this.drawRounded
                break
            case DotType.verticalLine:
                drawFunction = this.drawVerticalLine
                break
            case DotType.horizontalLine:
                drawFunction = this.drawHorizontalLine
                break
            case DotType.extraRounded:
                drawFunction = this.drawExtraRounded
                break
            case DotType.diamond:
                drawFunction = this.drawDiamond
                break
            case DotType.smallSquare:
                drawFunction = this.drawSmallSquare
                break
            case DotType.tinySquare:
                drawFunction = this.drawTinySquare
                break
            case DotType.wave:
                drawFunction = this.drawWave
                break
            case DotType.square:
            default:
                drawFunction = this.drawSquare
                break
        }

        drawFunction.call(this, args)
    }

    private rotateFigure({ x, y, size, rotation = 0, draw }: RotateFigureArgs): void {
        const cx = x + size / 2
        const cy = y + size / 2

        draw()
        this._element?.setAttribute('transform', `rotate(${numToAttr((180 * rotation) / Math.PI)},${cx},${cy})`)
    }

    private basicDot(args: BasicFigureDrawArgs): void {
        const { size, x, y } = args

        this.rotateFigure({
            ...args,
            draw: () => {
                this._element = this.document.createElementNS('http://www.w3.org/2000/svg', 'circle')
                this._element.setAttribute('cx', numToAttr(x + size / 2))
                this._element.setAttribute('cy', numToAttr(y + size / 2))
                this._element.setAttribute('r', numToAttr(size / 2))
            }
        })
    }

    private basicSquare(args: BasicFigureDrawArgs): void {
        const { size, x, y } = args

        this.rotateFigure({
            ...args,
            draw: () => {
                this._element = this.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
                this._element.setAttribute('x', numToAttr(x))
                this._element.setAttribute('y', numToAttr(y))
                this._element.setAttribute('width', numToAttr(size))
                this._element.setAttribute('height', numToAttr(size))
            }
        })
    }

    //if rotation === 0 - right side is rounded
    private basicSideRounded(args: BasicFigureDrawArgs): void {
        const { size, x, y } = args

        this.rotateFigure({
            ...args,
            draw: () => {
                const el = this.document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement
                el.setAttribute(                    
                    'd',
                    svgPath`M ${x} ${y}
          v ${size}
          h ${size / 2}
          a ${size / 2} ${size / 2}, 0, 0, 0, 0 ${-size}
          z`)
                this._element = el
            }
        })
    }

    //if rotation === 0 - top right corner is rounded
    private basicCornerRounded(args: BasicFigureDrawArgs): void {
        const { size, x, y } = args

        this.rotateFigure({
            ...args,
            draw: () => {
                const el = this.document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement
                el.setAttribute(                    
                    'd',
                    svgPath`M ${x} ${y}
          v ${size}
          h ${size}
          v ${-size / 2}
          a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}
          z`)
                this._element = el
            }
        })
    }

    //if rotation === 0 - top right corner is rounded
    private basicCornerExtraRounded(args: BasicFigureDrawArgs): void {
        const { size, x, y } = args

        this.rotateFigure({
            ...args,
            draw: () => {
                const el = this.document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement
                el.setAttribute(                    
                    'd',
                    svgPath`M ${x} ${y}
          v ${size}
          h ${size}
          a ${size} ${size}, 0, 0, 0, ${-size} ${-size}
          z`)
                this._element = el
            }
        })
    }

    //if rotation === 0 - left bottom and right top corners are rounded
    private basicCornersRounded(args: BasicFigureDrawArgs): void {
        const { size, x, y } = args

        this.rotateFigure({
            ...args,
            draw: () => {
                const el = this.document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement
                el.setAttribute(                    
                    'd',
                    svgPath`M ${x} ${y}
          v ${size / 2}
          a ${size / 2} ${size / 2}, 0, 0, 0, ${size / 2} ${size / 2}
          h ${size / 2}
          v ${-size / 2}
          a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}
          z`)
                this._element = el
            }
        })
    }

    // rotation === 0: the filled neighbor is BELOW this cell.
    // Base is the bottom edge P1↔P2. Crest P3 lies on the top edge at x + 0.2*size.
    // Other orientations are produced by rotateFigure.
    private basicWave(args: BasicFigureDrawArgs): void {
      const { size, x, y } = args

      // Node positions (neighbor BELOW case)
      const P1x = x,           P1y = y + size          // bottom-left corner
      const P2x = x + size,    P2y = y + size          // bottom-right corner
      const P3x = x + size*0.05, P3y = y                // 20% along the top edge

      // Bézier handle lengths as a fraction of cell size.
      // Tune 0.50–0.65 to adjust "pointiness" (bigger = sharper crest).
      const L23 = size * 0.65  // for segment P2→P3 (both ends)
      const L31 = size * 0.5  // for segment P3→P1 (both ends)

      // Polar offset helper (angles in degrees; +x right, +y down)
      const off = (px: number, py: number, deg: number, r: number) => {
        const t = (deg * Math.PI) / 180
        return [px + r * Math.cos(t), py + r * Math.sin(t)] as const
      }

      // === Segment P2 → P3: cubic with your angles
      // leave P2 at -90° (vertical up)
      const [C12x, C12y] = off(P2x, P2y, -90, L23)
      // arrive P3 at +5° (5° below horizontal right)
      const [C23x, C23y] = off(P3x, P3y, 5,  L23)

      // === Segment P3 → P1: cubic with your angles
      // leave P3 at +70° (20° right of vertical down)
      const [C31x, C31y] = off(P3x, P3y, 65,  L31)
      // arrive P1 at -55° (35° right of vertical up)
      const [C1x,  C1y ] = off(P1x, P1y, -90,  L31)

      this.rotateFigure({
        ...args,
        draw: () => {
          const el = this.document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement
          el.setAttribute(
            'd',
            svgPath`
              M ${P1x} ${P1y}
              L ${P2x} ${P2y}
              C ${C12x} ${C12y} ${C23x} ${C23y} ${P3x} ${P3y}
              C ${C31x} ${C31y} ${C1x}  ${C1y}  ${P1x} ${P1y}
              z`
          )
          this._element = el
        }
      })
    }


    private drawDot({ x, y, size }: DrawArgs): void {
        this.basicDot({ x, y, size, rotation: 0 })
    }

    private drawRandomDot({ x, y, size }: DrawArgs): void {
        const randomFactor = Math.random() * (1 - 0.75) + 0.75
        this.basicDot({ x, y, size: size * randomFactor, rotation: 0 })
    }

    private drawSquare({ x, y, size }: DrawArgs): void {
        this.basicSquare({ x, y, size, rotation: 0 })
    }

    private drawSmallSquare({ x, y, size }: DrawArgs): void {
        const originalSize = size

        size = originalSize * 0.7
        x = x + originalSize * 0.15
        y = y + originalSize * 0.15

        this.basicSquare({ x, y, size, rotation: 0 })
    }

    private drawTinySquare({ x, y, size }: DrawArgs): void {
        const originalSize = size

        size = originalSize * 0.3
        x = x + originalSize * 0.35
        y = y + originalSize * 0.35

        this.basicSquare({ x, y, size, rotation: 0 })
    }

    private drawDiamond({ x, y, size }: DrawArgs): void {
        this.basicSquare({ x, y, size, rotation: Math.PI / 4 })
    }

    private drawRounded({ x, y, size, getNeighbor }: DrawArgs): void {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

        if (neighborsCount === 0) {
            this.basicDot({ x, y, size, rotation: 0 })
            return
        }

        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this.basicSquare({ x, y, size, rotation: 0 })
            return
        }

        if (neighborsCount === 2) {
            let rotation = 0

            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2
            } else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI
            } else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2
            }

            this.basicCornerRounded({ x, y, size, rotation })
            return
        }

        if (neighborsCount === 1) {
            let rotation = 0

            if (topNeighbor) {
                rotation = Math.PI / 2
            } else if (rightNeighbor) {
                rotation = Math.PI
            } else if (bottomNeighbor) {
                rotation = -Math.PI / 2
            }

            this.basicSideRounded({ x, y, size, rotation })
            return
        }
    }

    private drawVerticalLine({ x, y, size, getNeighbor }: DrawArgs): void {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

        if (
            neighborsCount === 0 ||
      (leftNeighbor && !(topNeighbor || bottomNeighbor)) ||
      (rightNeighbor && !(topNeighbor || bottomNeighbor))
        ) {
            this.basicDot({ x, y, size, rotation: 0 })
            return
        }

        if (topNeighbor && bottomNeighbor) {
            this.basicSquare({ x, y, size, rotation: 0 })
            return
        }

        if (topNeighbor && !bottomNeighbor) {
            const rotation = Math.PI / 2
            this.basicSideRounded({ x, y, size, rotation })
            return
        }

        if (bottomNeighbor && !topNeighbor) {
            const rotation = -Math.PI / 2
            this.basicSideRounded({ x, y, size, rotation })
            return
        }
    }

    private drawHorizontalLine({ x, y, size, getNeighbor }: DrawArgs): void {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

        if (
            neighborsCount === 0 ||
      (topNeighbor && !(leftNeighbor || rightNeighbor)) ||
      (bottomNeighbor && !(leftNeighbor || rightNeighbor))
        ) {
            this.basicDot({ x, y, size, rotation: 0 })
            return
        }

        if (leftNeighbor && rightNeighbor) {
            this.basicSquare({ x, y, size, rotation: 0 })
            return
        }

        if (leftNeighbor && !rightNeighbor) {
            const rotation = 0
            this.basicSideRounded({ x, y, size, rotation })
            return
        }

        if (rightNeighbor && !leftNeighbor) {
            const rotation = Math.PI
            this.basicSideRounded({ x, y, size, rotation })
            return
        }
    }

    private drawExtraRounded({ x, y, size, getNeighbor }: DrawArgs): void {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

        if (neighborsCount === 0) {
            this.basicDot({ x, y, size, rotation: 0 })
            return
        }

        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this.basicSquare({ x, y, size, rotation: 0 })
            return
        }

        if (neighborsCount === 2) {
            let rotation = 0

            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2
            } else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI
            } else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2
            }

            this.basicCornerExtraRounded({ x, y, size, rotation })
            return
        }

        if (neighborsCount === 1) {
            let rotation = 0

            if (topNeighbor) {
                rotation = Math.PI / 2
            } else if (rightNeighbor) {
                rotation = Math.PI
            } else if (bottomNeighbor) {
                rotation = -Math.PI / 2
            }

            this.basicSideRounded({ x, y, size, rotation })
            return
        }
    }

    private drawClassy({ x, y, size, getNeighbor }: DrawArgs): void {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

        if (neighborsCount === 0) {
            this.basicCornersRounded({ x, y, size, rotation: Math.PI / 2 })
            return
        }

        if (!leftNeighbor && !topNeighbor) {
            this.basicCornerRounded({ x, y, size, rotation: -Math.PI / 2 })
            return
        }

        if (!rightNeighbor && !bottomNeighbor) {
            this.basicCornerRounded({ x, y, size, rotation: Math.PI / 2 })
            return
        }

        this.basicSquare({ x, y, size, rotation: 0 })
    }

    private drawClassyRounded({ x, y, size, getNeighbor }: DrawArgs): void {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

        if (neighborsCount === 0) {
            this.basicCornersRounded({ x, y, size, rotation: Math.PI / 2 })
            return
        }

        if (!leftNeighbor && !topNeighbor) {
            this.basicCornerExtraRounded({ x, y, size, rotation: -Math.PI / 2 })
            return
        }

        if (!rightNeighbor && !bottomNeighbor) {
            this.basicCornerExtraRounded({ x, y, size, rotation: Math.PI / 2 })
            return
        }

        this.basicSquare({ x, y, size, rotation: 0 })
    }

    private drawWave({ x, y, size, getNeighbor }: DrawArgs): void {
      const leftNeighbor   = getNeighbor ? +getNeighbor(-1, 0) : 0
      const rightNeighbor  = getNeighbor ? +getNeighbor(1, 0)  : 0
      const topNeighbor    = getNeighbor ? +getNeighbor(0, -1) : 0
      const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1)  : 0

      const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

      // 0 neighbors → circle
      if (neighborsCount === 0) {
        this.basicDot({ x, y, size, rotation: 0 })
        return
      }

      // Opposite sides (N+S or E+W) OR 3–4 neighbors → square
      if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
        this.basicSquare({ x, y, size, rotation: 0 })
        return
      }

      // Exactly 2 neighbors, and they're adjacent → round the far corner
      if (neighborsCount === 2) {
        let rotation = 0
        if (leftNeighbor && topNeighbor) {
          rotation = Math.PI / 2          // rounds the bottom-right corner (far from L+T)
        } else if (topNeighbor && rightNeighbor) {
          rotation = Math.PI               // rounds the bottom-left corner
        } else if (rightNeighbor && bottomNeighbor) {
          rotation = -Math.PI / 2          // rounds the top-left corner
        }
        this.basicCornerRounded({ x, y, size, rotation })
        return
      }

      // Exactly 1 neighbor → "wave"
      if (neighborsCount === 1) {
        let rotation = 0
        if (rightNeighbor) {
          rotation = -Math.PI / 2
        } else if (bottomNeighbor) {
          rotation = 0
        } else if (leftNeighbor) {
          rotation = Math.PI / 2
        } else if (topNeighbor) {
          rotation = Math.PI
        }
        this.basicWave({ x, y, size, rotation })
        return
      }

    }

}
