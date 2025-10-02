import { DrawArgs } from '../types/helper.js'
import { DotType } from '../utils/options.js'
import { rotateFigure } from '../utils/svg.js'
import { DotElements } from './dot-elements.js'

const qrDotFigures: { [type in DotType]: (args: DrawArgs) => SVGElement } = {
    [DotType.dot]: args => DotElements.dot(args),
    [DotType.randomDot]: ({ size, ...args }) => {
        const randomFactor = Math.random() * (1 - 0.75) + 0.75
        return DotElements.dot({
            ...args,
            size: size * randomFactor
        })
    },
    [DotType.rounded]: ({ x, y, size, document, getNeighbor }) => {
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
                draw: DotElements.cornerRounded
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
                draw: DotElements.sideRounded
            })
        }
    },
    [DotType.extraRounded]: ({ x, y, size, document, getNeighbor }) => {
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
                draw: DotElements.cornerExtraRounded
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
                draw: DotElements.sideRounded
            })
        }
    },
    [DotType.verticalLine]: ({ x, y, size, document, getNeighbor }) => {
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

        if (topNeighbor && bottomNeighbor) {
            return DotElements.square({
                x, y, size,
                document
            })
        } else if (topNeighbor && !bottomNeighbor) {
            const rotation = Math.PI / 2
            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: DotElements.sideRounded
            })
        } else if (bottomNeighbor && !topNeighbor) {
            const rotation = -Math.PI / 2
            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: DotElements.sideRounded
            })
        }

        return DotElements.dot({
            x, y, size,
            document
        })
    },
    [DotType.horizontalLine]: ({ x, y, size, document, getNeighbor }) => {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0

        if (leftNeighbor && rightNeighbor) {
            return DotElements.square({
                x, y, size,
                document
            })
        } else if (leftNeighbor && !rightNeighbor) {
            const rotation = 0
            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: DotElements.sideRounded
            })
        } else if (rightNeighbor && !leftNeighbor) {
            const rotation = Math.PI
            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: DotElements.sideRounded
            })
        }

        return DotElements.dot({
            x, y, size,
            document
        })
    },
    [DotType.classy]: ({ x, y, size, document, getNeighbor }) => {
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
                draw: DotElements.cornerRounded
            })
        } else if (!rightNeighbor && !bottomNeighbor) {
            return rotateFigure({
                x, y, size, rotation: Math.PI / 2,
                document,
                draw: DotElements.cornerRounded
            })
        }

        return DotElements.square({
            x, y, size,
            document
        })
    },
    [DotType.classyRounded]: ({ x, y, size, document, getNeighbor }) => {
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
                draw: DotElements.cornerExtraRounded
            })
        } else if (!rightNeighbor && !bottomNeighbor) {
            return rotateFigure({
                x, y, size, rotation: Math.PI / 2,
                document,
                draw: DotElements.cornerExtraRounded
            })
        }

        return DotElements.square({
            x, y, size,
            document
        })
    },
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
        draw: DotElements.square
    }),
    [DotType.wave]: ({ x, y, size, document, getNeighbor }) => {
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
                draw: DotElements.cornerExtraRounded
            })
        } else {
            let rotation = 0

            if (rightNeighbor) {
                rotation = Math.PI / 2
            } else if (bottomNeighbor) {
                rotation = Math.PI
            } else if (leftNeighbor) {
                rotation = -Math.PI / 2
            }

            return rotateFigure({
                x, y, size, rotation,
                document,
                draw: DotElements.wave
            })
        }
    }
}

export function getQrDotFigure(type: `${DotType}`) {
    return qrDotFigures[type] || qrDotFigures[DotType.square]
}
