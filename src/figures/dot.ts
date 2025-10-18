import { DrawArgs } from '../types/helper.js'
import { DotType, Plugin } from '../utils/options.js'
import { rotateFigure } from '../utils/svg.js'
import { DotElements } from './dot-elements.js'

const compoundDots = {
    rounded: ({ x, y, size, document, getNeighbor }: DrawArgs, { corner = DotElements.cornerRounded, end = DotElements.sideRounded } = {}) => {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

        if (neighborsCount === 0) {
            return DotElements.dot({
                x, y, size,
                document
            })
        } else if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            return DotElements.square({
                x, y, size,
                document
            })
        } else if (neighborsCount === 2) {
            let rotation = 0

            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2
            } else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI
            } else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2
            }

            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: corner
            })
        } else {
            let rotation = 0

            if (topNeighbor) {
                rotation = Math.PI / 2
            } else if (rightNeighbor) {
                rotation = Math.PI
            } else if (bottomNeighbor) {
                rotation = -Math.PI / 2
            }

            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: end
            })
        }
    },
    classy: ({ x, y, size, document, getNeighbor }: DrawArgs, { corner = DotElements.cornerRounded } = {}) => {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

        if (neighborsCount === 0) {
            return rotateFigure({
                x, y, size, rotation: Math.PI / 2,
                document,
                draw: DotElements.cornersRounded
            })
        } else if (!leftNeighbor && !topNeighbor) {
            return rotateFigure({
                x, y, size, rotation: -Math.PI / 2,
                document,
                draw: corner
            })
        } else if (!rightNeighbor && !bottomNeighbor) {
            return rotateFigure({
                x, y, size, rotation: Math.PI / 2,
                document,
                draw: corner
            })
        }

        return DotElements.square({
            x, y, size,
            document
        })
    },
    line: ({ x, y, size, document, getNeighbor }: DrawArgs, { stripe = size, rotation = 0 } = {}) => {
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        if (topNeighbor && bottomNeighbor) {
            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: _ => DotElements.square({
                    x, y, size,
                    document
                }, { width: stripe })
            })
        } else if (topNeighbor && !bottomNeighbor) {
            rotation += Math.PI / 2
            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: args => DotElements.sideRounded(args, { height: stripe })
            })
        } else if (bottomNeighbor && !topNeighbor) {
            rotation -= Math.PI / 2
            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: args => DotElements.sideRounded(args, { height: stripe })
            })
        }

        return rotateFigure({
            x, y, size, rotation,
            document,
            draw: _ => DotElements.dot({
                x: x + (size - stripe) / 2,
                y: y + (size - stripe) / 2,
                size: stripe,
                document
            })
        })
    }
}

const qrDotFigures: { [type in DotType]: (args: DrawArgs) => SVGElement } = {
    [DotType.dot]: args => DotElements.dot(args),
    [DotType.randomDot]: ({ size, ...args }) => {
        const randomFactor = Math.random() * (1 - 0.75) + 0.75
        return DotElements.dot({
            ...args,
            size: size * randomFactor
        })
    },
    [DotType.rounded]: args => compoundDots.rounded(args),
    [DotType.extraRounded]: args => compoundDots.rounded(args, { corner: DotElements.cornerExtraRounded }),
    [DotType.verticalLine]: args => compoundDots.line(args),
    [DotType.horizontalLine]: ({ getNeighbor, ...args }) => compoundDots.line({
        ...args,
        getNeighbor: getNeighbor ? (x, y) => getNeighbor(y, x) : undefined
    }, { rotation: -Math.PI / 2 }),
    [DotType.classy]: args => compoundDots.classy(args),
    [DotType.classyRounded]: args => compoundDots.classy(args, { corner: DotElements.cornerExtraRounded }),
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
    [DotType.wave]: args => compoundDots.rounded(args, { corner: DotElements.cornerExtraRounded, end: DotElements.wave }),
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
    [DotType.zebraVertical]: args => compoundDots.line(args, { stripe: args.size * 0.8 }),
    [DotType.zebraHorizontal]: ({ getNeighbor, ...args }) => compoundDots.line({
        ...args,
        getNeighbor: getNeighbor ? (x, y) => getNeighbor(y, x) : undefined
    }, { stripe: args.size * 0.8, rotation: -Math.PI / 2 })
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
