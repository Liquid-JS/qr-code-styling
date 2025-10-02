import { DrawArgs } from '../types/helper.js'
import { CornerDotType } from '../utils/options.js'
import { rotateFigure } from '../utils/svg.js'
import { DotElements } from './dot-elements.js'

const qrCornerDotFigures: { [type in CornerDotType]: (args: DrawArgs) => SVGElement } = {
    [CornerDotType.dot]: args => rotateFigure({
        ...args,
        draw: DotElements.dot
    }),
    [CornerDotType.square]: args => rotateFigure({
        ...args,
        draw: DotElements.square
    }),
    [CornerDotType.heart]: args => DotElements.heart(args),
    [CornerDotType.extraRounded]: args => rotateFigure({
        ...args,
        draw: DotElements.rounded
    }),
    [CornerDotType.classy]: args => rotateFigure({
        ...args,
        draw: DotElements.classy
    }),
    [CornerDotType.inpoint]: args => rotateFigure({
        ...args,
        draw: DotElements.inpoint
    }),
    [CornerDotType.outpoint]: args => rotateFigure({
        ...args,
        rotation: (args.rotation || 0) + Math.PI,
        draw: DotElements.inpoint
    })
}

export function getQrCornerDotFigure(type: `${CornerDotType}`) {
    return qrCornerDotFigures[type] || qrCornerDotFigures[CornerDotType.square]
}
