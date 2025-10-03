import { DrawArgs } from '../types/helper.js'
import { CornerSquareType } from '../utils/options.js'
import { rotateFigure } from '../utils/svg.js'
import { SquareElements } from './square-elements.js'

const qrCornerSquareFigures: { [type in CornerSquareType]: (args: DrawArgs) => readonly [SVGPathElement, SVGPathElement] } = {
    [CornerSquareType.dot]: args => SquareElements.dot(args),
    [CornerSquareType.square]: args => SquareElements.square(args),
    [CornerSquareType.extraRounded]: args => SquareElements.extraRounded(args),
    [CornerSquareType.classy]: args => rotateFigure({
        ...args,
        draw: SquareElements.classy
    }),
    [CornerSquareType.inpoint]: args => rotateFigure({
        ...args,
        draw: SquareElements.inpoint
    }),
    [CornerSquareType.outpoint]: ({ rotation, ...args }) => rotateFigure({
        ...args,
        rotation: (rotation || 0) + Math.PI,
        draw: SquareElements.inpoint
    }),
    [CornerSquareType.centerCircle]: args => SquareElements.centerCircle(args)
}

export function getQrCornerSquareFigure(type: `${CornerSquareType}`) {
    return qrCornerSquareFigures[type] || qrCornerSquareFigures[CornerSquareType.square]
}

