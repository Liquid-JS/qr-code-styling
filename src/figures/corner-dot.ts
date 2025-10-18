import { DrawArgs } from '../types/helper.js'
import { CornerDotType, Plugin } from '../utils/options.js'
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
    }),
    [CornerDotType.star]: args => DotElements.star(args),
    [CornerDotType.pentagon]: args => DotElements.star(args, {
        spikes: 2.5,
        outerRadius: args.size / 2,
        innerRadius: args.size / 2
    }),
    [CornerDotType.hexagon]: args => DotElements.star(args, {
        spikes: 3,
        outerRadius: args.size / 2,
        innerRadius: args.size / 2
    }),
    [CornerDotType.diamond]: args => rotateFigure({
        ...args,
        rotation: Math.PI / 4,
        draw: args2 => DotElements.square(args2, { width: args2.size * 0.85, height: args2.size * 0.85 })
    })
}

export function getQrCornerDotFigure(type: `${CornerDotType}`) {
    return qrCornerDotFigures[type] || qrCornerDotFigures[CornerDotType.square]
}

export function drawPluginCornerDot(plugins: Plugin[]) {
    return (args: DrawArgs) => {
        for (const plugin of plugins) {
            const el = plugin.drawCornerDot?.(args)
            if (el)
                return el
        }
        return undefined
    }
}
