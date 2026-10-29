import { numToAttr, svgAttr } from './svg.js'

interface ImageSizeOptions {
    originalHeight: number
    originalWidth: number
    maxHiddenDots: number
    maxHiddenAxisDots?: number
    dotSize: number
    margin: number
}

interface ImageSizeResult {
    height: number
    width: number
    hideYDots: number
    hideXDots: number
}

export function calculateImageSize({
    originalHeight,
    originalWidth,
    maxHiddenDots,
    maxHiddenAxisDots,
    dotSize,
    margin
}: ImageSizeOptions): ImageSizeResult {
    const hideDots = { x: 0, y: 0 }
    const imageSize = { x: 0, y: 0 }

    if (
        originalHeight <= 0 ||
        originalWidth <= 0 ||
        maxHiddenDots <= 0 ||
        dotSize <= 0 ||
        4 * margin ** 2 > maxHiddenDots
    ) {
        return {
            height: 0,
            width: 0,
            hideYDots: 0,
            hideXDots: 0
        }
    }

    //If set, ensure maxHiddenAxisDots is odd and at least 1
    if (maxHiddenAxisDots && maxHiddenAxisDots % 2 == 0) maxHiddenAxisDots = Math.max(1, maxHiddenAxisDots - 1)

    //Determine the bigger and smaller image dimension
    const dimMax = Math.max(originalWidth, originalHeight)
    const dimMin = Math.min(originalWidth, originalHeight)

    //Find max image size along the bigger dimension
    let lower = 0
    let upper = (maxHiddenAxisDots || maxHiddenDots) - 2 * margin
    do {
        const newSize = lower + (upper - lower) / 2
        let dotsMax = Math.max(1, Math.ceil(newSize + 2 * margin))
        if (dotsMax % 2 == 0) dotsMax++
        let dotsMin = Math.max(1, Math.ceil((newSize * dimMin) / dimMax + 2 * margin))
        if (dotsMin % 2 == 0) dotsMin++

        if (dotsMax * dotsMin > maxHiddenDots) upper = newSize
        else lower = newSize
    } while (Math.abs(lower - upper) > 0.001)

    //Calculate how many dots the given size corresponds to
    const size = lower
    let hideMax = Math.max(1, Math.ceil(size + 2 * margin))
    if (hideMax % 2 == 0) hideMax++
    let hideMin = Math.max(1, Math.ceil((size * dimMin) / dimMax + 2 * margin))
    if (hideMin % 2 == 0) hideMin++

    //Set hidden dots along bigger and smaller dimension to the right axis
    if (originalWidth > originalHeight) {
        hideDots.x = hideMax
        hideDots.y = hideMin
    } else {
        hideDots.x = hideMin
        hideDots.y = hideMax
    }

    //Fit image to the hidden dots
    const maxW = (hideDots.x - 2 * margin) * dotSize
    const maxH = (hideDots.y - 2 * margin) * dotSize
    imageSize.x = maxW
    imageSize.y = (maxW * originalHeight) / originalWidth
    if (imageSize.y > maxH) {
        imageSize.y = maxH
        imageSize.x = (maxH * originalWidth) / originalHeight
    }

    return {
        height: Math.round(imageSize.y + 2 * margin * dotSize),
        width: Math.round(imageSize.x + 2 * margin * dotSize),
        hideYDots: hideDots.y,
        hideXDots: hideDots.x
    }
}

/**
 * Create an element drawing the image (a data URL) within the bounds; SVG images are embedded inline
 */
export function createImageElement(
    document: Document,
    imageUrl: string,
    { x, y, width, height }: { x: number, y: number, width: number, height: number }
): SVGElement {
    let image: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageUrl || '')

    if (imageUrl.startsWith('data:image/svg+xml;')) {
        let data = imageUrl.substring(19)
        const i = data.indexOf(',')
        const encoding = data.substring(0, i)
        data = data.substring(i + 1)

        switch (encoding) {
            case 'base64':
                data = typeof atob == 'function' ? atob(data) : Buffer.from(data, 'base64').toString('utf8')
                break
            default:
                data = ''
                break
        }

        if (data) {
            const container = new DOMParser().parseFromString(data, 'text/xml')
            const rootEl = Array.from(container.getElementsByTagName('svg'))
            if (rootEl.length) {
                image = rootEl[0]
                image.setAttribute('overflow', 'visible')
            }
        }
    }

    image.setAttribute('x', numToAttr(x))
    image.setAttribute('y', numToAttr(y))
    image.setAttribute('width', svgAttr`${width}px`)
    image.setAttribute('height', svgAttr`${height}px`)
    return image
}
