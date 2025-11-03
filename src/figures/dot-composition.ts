import { DrawArgs } from '../types/helper.js'
import { rotateFigure } from '../utils/svg.js'
import { DotElements } from './dot-elements.js'

/**
 * Draw square lines with rounded corners and endpoints
 */
export function roundedCorners({ x, y, size, document, getNeighbor }: DrawArgs, { corner = DotElements.cornerRounded, end = DotElements.sideRounded } = {}) {
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
        // Rounded corner
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
        // Endpoint
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
}

/**
 * Draw square lines with rounded corners and half-rounded endpoints
 */
export function classy({ x, y, size, document, getNeighbor }: DrawArgs, { corner = DotElements.cornerRounded } = {}) {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor

    if (neighborsCount === 0) {
        return rotateFigure({
            x, y, size, rotation: Math.PI / 2,
            document,
            draw: DotElements.classyDot
        })
    } else if (!leftNeighbor && !topNeighbor) {
        // Top right corner
        return rotateFigure({
            x, y, size, rotation: -Math.PI / 2,
            document,
            draw: corner
        })
    } else if (!rightNeighbor && !bottomNeighbor) {
        // Bottom left corner
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
}

/**
 * Draw stripes with rounded or square endpoints
 */
export function stripes({ x, y, size, document, getNeighbor }: DrawArgs, { stripe = size, rotation = 0, endpoint = DotElements.sideRounded, dot = DotElements.dot } = {}) {
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0

    if (topNeighbor && bottomNeighbor) {
        // Mid-stripe
        return rotateFigure({
            x, y, size, rotation,
            document,
            draw: _ => DotElements.square({
                x, y, size,
                document
            }, { width: stripe })
        })
    } else if (topNeighbor && !bottomNeighbor) {
        // Top endpoint
        rotation += Math.PI / 2
        return rotateFigure({
            x, y, size, rotation,
            document,
            draw: args => endpoint(args, { height: stripe })
        })
    } else if (bottomNeighbor && !topNeighbor) {
        // Bottom endpoint
        rotation -= Math.PI / 2
        return rotateFigure({
            x, y, size, rotation,
            document,
            draw: args => endpoint(args, { height: stripe })
        })
    }

    return rotateFigure({
        x, y, size, rotation,
        document,
        draw: _ => dot({
            x: x + (size - stripe) / 2,
            y: y + (size - stripe) / 2,
            size: stripe,
            document
        })
    })
}
