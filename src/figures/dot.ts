import { DrawArgs } from '../types/helper.js'
import { DotType, Plugin } from '../utils/options.js'
import { rotateFigure } from '../utils/svg.js'
import { classy, roundedCorners, stripes } from './dot-composition.js'
import { DotElements } from './dot-elements.js'

const qrDotFigures: { [type in DotType]: (args: DrawArgs) => SVGElement } = {
    [DotType.dot]: args => DotElements.dot(args),
    [DotType.randomDot]: ({ size, x, y, getPRandom, ...args }) => {
        const rnd = (getPRandom || Math.random)
        const randomFactor = rnd() * (1 - 0.75) + 0.75

        return DotElements.dot({
            ...args,
            size: size * randomFactor,
            x: x + size * rnd() * (1 - randomFactor),
            y: y + size * rnd() * (1 - randomFactor)
        })
    },
    [DotType.rounded]: args => roundedCorners(args),
    [DotType.extraRounded]: args => roundedCorners(args, { corner: DotElements.cornerExtraRounded }),
    [DotType.verticalLine]: args => stripes(args),
    [DotType.horizontalLine]: ({ getNeighbor, ...args }) => stripes({
        ...args,
        getNeighbor: getNeighbor ? (x, y) => getNeighbor(y, x) : undefined
    }, { rotation: -Math.PI / 2 }),
    [DotType.classy]: args => classy(args),
    [DotType.classyRounded]: args => classy(args, { corner: DotElements.cornerExtraRounded }),
    [DotType.square]: args => DotElements.square(args),
    [DotType.smallSquare]: ({ x, y, size, document }) => {
        const originalSize = size

        size = originalSize * 0.7
        x = x + originalSize * 0.15
        y = y + originalSize * 0.15

        return DotElements.square({
            x, y, size,
            document
        })
    },
    [DotType.tinySquare]: ({ x, y, size, document }) => {
        const originalSize = size

        size = originalSize * 0.3
        x = x + originalSize * 0.35
        y = y + originalSize * 0.35

        return DotElements.square({
            x, y, size,
            document
        })
    },
    [DotType.diamond]: args => rotateFigure({
        ...args,
        rotation: Math.PI / 4,
        draw: args2 => DotElements.square(args2, { width: args2.size * 0.85, height: args2.size * 0.85 })
    }),
    [DotType.wave]: args => roundedCorners(args, {
        corner: DotElements.cornerExtraRounded,
        end: DotElements.wave
    }),
    [DotType.heart]: args => DotElements.heart(args),
    [DotType.star]: args => DotElements.star(args),
    [DotType.weave]: args => DotElements.weave(args),
    [DotType.pentagon]: args => DotElements.star(args, {
        spikes: 2.5,
        outerRadius: args.size / 2,
        innerRadius: args.size / 2
    }),
    [DotType.hexagon]: args => DotElements.star(args, {
        spikes: 3,
        outerRadius: args.size / 2,
        innerRadius: args.size / 2
    }),
    [DotType.zebraVertical]: args => stripes(args, { stripe: args.size * 0.8 }),
    [DotType.zebraHorizontal]: ({ getNeighbor, ...args }) => stripes({
        ...args,
        getNeighbor: getNeighbor ? (x, y) => getNeighbor(y, x) : undefined
    }, { stripe: args.size * 0.8, rotation: -Math.PI / 2 }),
    [DotType.blocksVertical]: args => stripes(args, {
        stripe: args.size * 0.8,
        endpoint: (_args, _params) => {
            const rnd = (args.getPRandom || Math.random)
            const width = args.size * (1 - rnd() * 0.25)
            const x = args.x - (args.size - width) / 2
            return DotElements.square({ ..._args, x }, { ..._params, width })
        },
        dot: (_args) => {
            const rnd = (args.getPRandom || Math.random)
            const height = args.size * (1 - rnd() * 0.25)
            const y = args.y + (args.size - height) * rnd()
            return DotElements.square({ ..._args, y }, { height })
        }
    }),
    [DotType.blocksHorizontal]: ({ getNeighbor, ...args }) => stripes({
        ...args,
        getNeighbor: getNeighbor ? (x, y) => getNeighbor(y, x) : undefined
    }, {
        stripe: args.size * 0.8,
        rotation: -Math.PI / 2,
        endpoint: (_args, _params) => {
            const rnd = (args.getPRandom || Math.random)
            const width = args.size * (1 - rnd() * 0.25)
            const x = args.x - (args.size - width) / 2
            return DotElements.square({ ..._args, x }, { ..._params, width })
        },
        dot: (_args) => {
            const rnd = (args.getPRandom || Math.random)
            const height = args.size * (1 - rnd() * 0.25)
            const y = args.y + (args.size - height) * rnd()
            return DotElements.square({ ..._args, y }, { height })
        }
    })
}

export function getQrDotFigure(type: `${DotType}`, plugins?: Plugin[]) {
    const defaultDraw = qrDotFigures[type] || qrDotFigures[DotType.square]
    if (!plugins?.length)
        return defaultDraw

    const drawPlugin = drawPluginDot(plugins)
    return (args: DrawArgs) => drawPlugin(args) || defaultDraw(args)
}

export function drawPluginDot(plugins: Plugin[]) {
    return (args: DrawArgs) => {
        for (const plugin of plugins) {
            const el = plugin.drawDot?.(args)
            if (el)
                return el
        }
        return undefined
    }
}
