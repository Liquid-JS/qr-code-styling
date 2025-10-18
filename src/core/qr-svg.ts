import { QRCodeMinimal } from '@liquid-js/qrcode-generator/lib/qrcode/QRCodeMinimal.js'
import { QRUtil } from '@liquid-js/qrcode-generator/lib/qrcode/QRUtil.js'
import { drawPluginCornerDot, getQrCornerDotFigure } from '../figures/corner-dot.js'
import { drawPluginCornerSquare, getQrCornerSquareFigure } from '../figures/corner-square.js'
import { getQrDotFigure } from '../figures/dot.js'
import { browserImageTools } from '../tools/browser-image-tools.js'
import { parseColor } from '../utils/color.js'
import { Gradient, GradientType } from '../utils/gradient.js'
import { calculateImageSize } from '../utils/image.js'
import { CornerDotType, CornerSquareType, DotType, ImageMode, Options, ShapeType } from '../utils/options.js'
import { numToAttr } from '../utils/svg.js'
import { DrawArgs } from '../types/helper.js'

const squareMask = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
]

const cornerSquareTypes = new Set<string>(Object.values(CornerSquareType))
function isCornerSquareType(val?: string): val is `${CornerSquareType}` {
    return !!(val && cornerSquareTypes.has(val))
}

const dotMask = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
]

const cornerDotTypes = new Set<string>(Object.values(CornerDotType))
function isCornerDotType(val?: string): val is `${CornerDotType}` {
    return !!(val && cornerDotTypes.has(val))
}

export class QRSVG {
    private _element: SVGSVGElement

    get element() {
        return this._element
    }

    private defs: SVGElement

    private backgroundMask?: SVGElement
    private backgroundMaskGroup?: SVGElement

    private dotsMask?: SVGElement
    private dotsMaskGroup?: SVGElement

    private lightDotsMask?: SVGElement
    private lightDotsMaskGroup?: SVGElement

    private qr?: QRCodeMinimal
    private document: Document
    private imageTools: typeof browserImageTools

    constructor(
        private options: Pick<
            Options,
            | 'width'
            | 'height'
            | 'document'
            | 'imageTools'
            | 'image'
            | 'imageOptions'
            | 'dotsOptions'
            | 'cornersDotOptions'
            | 'cornersSquareOptions'
            | 'backgroundOptions'
            | 'shape'
            | 'plugins'
        > & { errorCorrectionPercent: number }
    ) {
        this.document = options.document
        this._element = this.document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        const width = numToAttr(options.width)
        const height = numToAttr(options.height)
        this._element.setAttribute('width', width)
        this._element.setAttribute('height', height)
        this._element.setAttribute('viewBox', `0 0 ${width} ${height}`)
        this.defs = this.document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        this._element.appendChild(this.defs)
        this.imageTools = options.imageTools || browserImageTools
    }

    get width(): number {
        return this.options.width
    }

    get height(): number {
        return this.options.height
    }

    async drawQR(qr: QRCodeMinimal): Promise<void> {
        const count = qr.getModuleCount()
        const typeNumber = parseInt(((count - 17) / 4).toFixed(0), 10)
        const dotSize = this.options.dotsOptions.size
        let drawImageSize = {
            hideXDots: 0,
            hideYDots: 0,
            width: 0,
            height: 0
        }

        this.qr = qr

        if (this.options.image) {
            //We need it to get image size
            const size = await this.imageTools.getSize(this.options.image, this.options.imageOptions.crossOrigin)
            const { imageOptions, errorCorrectionPercent } = this.options

            if (imageOptions.mode == ImageMode.background) {
                const margin = (this.options.backgroundOptions && this.options.backgroundOptions.margin) || 0
                const maxWidth = (this.options.width - 2 * margin * dotSize) * imageOptions.imageSize
                const maxHeight = (this.options.height - 2 * margin * dotSize) * imageOptions.imageSize
                let { width, height } = size

                height = (height / width) * maxWidth
                width = maxWidth

                if (height > maxHeight) {
                    width = (width / height) * maxHeight
                    height = maxHeight
                }

                drawImageSize = {
                    hideXDots: 0,
                    hideYDots: 0,
                    width,
                    height
                }
            } else {
                const coverLevel = imageOptions.imageSize * errorCorrectionPercent
                const alignment = QRUtil.getPatternPosition(typeNumber)
                const maxHiddenDots = Math.floor(
                    coverLevel * (count * count - 3 * 8 * 8 - 2 * (count - 16) - alignment.length ** 2 * 25)
                )

                drawImageSize = calculateImageSize({
                    originalWidth: size.width,
                    originalHeight: size.height,
                    maxHiddenDots,
                    maxHiddenAxisDots: count - 14,
                    dotSize,
                    margin: imageOptions.margin
                })
            }
        }

        this.drawBackground()

        if (
            this.options.imageOptions.mode != ImageMode.overlay &&
            this.options.image &&
            drawImageSize.width > 0 &&
            drawImageSize.height > 0
        ) {
            await this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize })
        }

        this.drawDots((i: number, j: number): boolean => {
            if (this.options.imageOptions.mode == ImageMode.center) {
                if (
                    i >= (count - drawImageSize.hideXDots) / 2 &&
                    i < (count + drawImageSize.hideXDots) / 2 &&
                    j >= (count - drawImageSize.hideYDots) / 2 &&
                    j < (count + drawImageSize.hideYDots) / 2
                ) {
                    return false
                }
            }

            if ((i < 8 && j < 8) || (i >= count - 8 && j < 8) || (j >= count - 8 && i < 8)) return false

            return true
        })

        if (
            this.options.imageOptions.mode == ImageMode.overlay &&
            this.options.image &&
            drawImageSize.width > 0 &&
            drawImageSize.height > 0
        ) {
            await this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize })
        }

        this.drawCorners()
    }

    drawBackground(): void {
        const options = this.options

        if (this._element && options.backgroundOptions) {
            const gradientOptions = options.backgroundOptions.gradient
            const color = options.backgroundOptions.color

            this.createColor({
                options: gradientOptions,
                color,
                additionalRotation: 0,
                x: 0,
                y: 0,
                height: options.height,
                width: options.width,
                name: 'background-color'
            })

            const size = Math.min(options.width, options.height)
            const element = this.document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            [this.backgroundMask, this.backgroundMaskGroup] = this.createMask('mask-background-color')
            this.defs.appendChild(this.backgroundMask)

            element.setAttribute('x', numToAttr((options.width - size) / 2))
            element.setAttribute('y', numToAttr((options.height - size) / 2))
            element.setAttribute('width', numToAttr(size))
            element.setAttribute('height', numToAttr(size))
            element.setAttribute('rx', numToAttr((size / 2) * (options.backgroundOptions.round || 0)))

            this.backgroundMaskGroup.appendChild(element)
        }
    }

    drawDots(filter?: (i: number, j: number) => boolean): void {
        if (!this.qr) {
            throw new Error('QR code is not defined')
        }

        const options = this.options
        const count = this.qr.getModuleCount()

        if (count > options.width || count > options.height) {
            throw new Error('The canvas is too small')
        }

        const dotSize = this.options.dotsOptions.size
        let minSize = Math.min(options.width, options.height)
        if (options.imageOptions.mode == ImageMode.background) minSize -= 2 * dotSize * (options.imageOptions.margin || 0)
        const xBeginning = Math.floor((options.width - count * dotSize) / 2)
        const yBeginning = Math.floor((options.height - count * dotSize) / 2)
        let draw = getQrDotFigure(options.dotsOptions.type, options.plugins);

        [this.dotsMask, this.dotsMaskGroup] = this.createMask('mask-dot-color')
        this.defs.appendChild(this.dotsMask)

        if (options.imageOptions.mode == ImageMode.background) {
            [this.lightDotsMask, this.lightDotsMaskGroup] = this.createMask('mask-light-dot-color')
            this.defs.appendChild(this.lightDotsMask)
        }

        let margin = 0
        let additionalDots = 0
        let fakeCount = count

        if (options.shape === ShapeType.circle) {
            margin = (this.options.backgroundOptions && this.options.backgroundOptions.margin) || 0
            additionalDots = Math.floor((minSize / dotSize - count - 2 * margin) / 2)
            fakeCount = count + additionalDots * 2
        } else if (options.imageOptions.mode == ImageMode.background) {
            additionalDots = 1
            fakeCount = count + additionalDots * 2
        }

        const xFakeBeginning = xBeginning - additionalDots * dotSize
        const yFakeBeginning = yBeginning - additionalDots * dotSize
        const colorX = xFakeBeginning
        const colorY = yFakeBeginning
        const colorCount = count + additionalDots * 2
        const fakeMatrix: Array<Array<boolean | undefined>> = new Array(fakeCount)
        const center = Math.floor(fakeCount / 2)

        for (let i = 0; i < fakeCount; i++) {
            fakeMatrix[i] = new Array(fakeCount)
            for (let j = 0; j < fakeCount; j++) {
                if (
                    i > additionalDots - 1 &&
                    i < fakeCount - additionalDots &&
                    j > additionalDots - 1 &&
                    j < fakeCount - additionalDots
                ) {
                    const ii = i - additionalDots
                    const jj = j - additionalDots
                    if (filter && !filter(ii, jj)) fakeMatrix[i][j] = undefined
                    else fakeMatrix[i][j] = !!this.qr.isDark(jj, ii)
                    continue
                }

                if (
                    options.shape === ShapeType.circle &&
                    Math.sqrt((i - center) * (i - center) + (j - center) * (j - center)) > center
                ) {
                    fakeMatrix[i][j] = undefined
                    continue
                }

                if (
                    i == additionalDots - 1 ||
                    i == fakeCount - additionalDots ||
                    j == additionalDots - 1 ||
                    j == fakeCount - additionalDots
                ) {
                    if (
                        (j == additionalDots - 1 && (i < additionalDots + 8 || i > fakeCount - additionalDots - 9)) ||
                        (j == fakeCount - additionalDots && i < additionalDots + 8) ||
                        (i == additionalDots - 1 && (j < additionalDots + 8 || j > fakeCount - additionalDots - 9)) ||
                        (i == fakeCount - additionalDots && j < additionalDots + 8)
                    )
                        fakeMatrix[i][j] = undefined
                    else fakeMatrix[i][j] = false
                    continue
                }

                // Get random dots from QR code to show it outside of QR code
                fakeMatrix[i][j] = this.qr.isDark(
                    j - 2 * additionalDots < 0 ? j : j >= count ? j - 2 * additionalDots : j - additionalDots,
                    i - 2 * additionalDots < 0 ? i : i >= count ? i - 2 * additionalDots : i - additionalDots
                )
            }
        }

        const typeNr = (count - 17) / 4
        const alignment = QRUtil.getPatternPosition(typeNr)

        for (let i = 0; i < fakeCount; i++) {
            const iAlign = alignment.find((v) => i - additionalDots > v - 3 && i - additionalDots < v + 3)
            for (let j = 0; j < fakeCount; j++) {
                const jAlign = alignment.find((v) => j - additionalDots > v - 3 && j - additionalDots < v + 3)
                if (fakeMatrix[i][j] == undefined) continue

                if (this.lightDotsMask) {
                    draw =
                        iAlign &&
                            jAlign &&
                            ((iAlign != alignment[0] && jAlign != alignment[0]) ||
                                (jAlign != alignment[0] && jAlign != alignment[alignment.length - 1]) ||
                                (iAlign != alignment[0] && iAlign != alignment[alignment.length - 1]))
                            ? getQrDotFigure(DotType.square)
                            : getQrDotFigure(DotType.tinySquare)
                }

                if (!fakeMatrix[i][j]) {
                    if (this.lightDotsMask) {
                        if (this.lightDotsMaskGroup) {
                            this.lightDotsMaskGroup.appendChild(draw({
                                x: xFakeBeginning + i * dotSize,
                                y: yFakeBeginning + j * dotSize,
                                size: dotSize,
                                document: this.options.document,
                                getNeighbor: (xOffset: number, yOffset: number): boolean => fakeMatrix[i + xOffset]?.[j + yOffset] === false
                            }))
                        }
                    }
                    continue
                }

                if (this.dotsMaskGroup) {
                    this.dotsMaskGroup.appendChild(draw({
                        x: xFakeBeginning + i * dotSize,
                        y: yFakeBeginning + j * dotSize,
                        size: dotSize,
                        document: this.options.document,
                        getNeighbor: (xOffset: number, yOffset: number): boolean => fakeMatrix[i + xOffset]?.[j + yOffset] === true
                    }))
                }
            }
        }

        if (this.lightDotsMask) {
            this.createColor({
                options: options.imageOptions.fill.gradient,
                color: options.imageOptions.fill.color,
                additionalRotation: 0,
                x: colorX,
                y: colorY,
                height: colorCount * dotSize,
                width: colorCount * dotSize,
                name: 'light-dot-color'
            })
        }

        this.createColor({
            options: options.dotsOptions?.gradient,
            color: options.dotsOptions.color,
            additionalRotation: 0,
            x: colorX,
            y: colorY,
            height: colorCount * dotSize,
            width: colorCount * dotSize,
            name: 'dot-color'
        })
    }

    drawCorners(): void {
        if (!this.qr) {
            throw new Error('QR code is not defined')
        }

        const element = this._element
        const options = this.options

        if (!element) {
            throw new Error('Element code is not defined')
        }

        const count = this.qr.getModuleCount()
        const dotSize = this.options.dotsOptions.size
        const cornersSquareSize = dotSize * 7
        const cornersDotSize = dotSize * 3
        const xBeginning = Math.floor((options.width - count * dotSize) / 2)
        const yBeginning = Math.floor((options.height - count * dotSize) / 2);

        [
            [0, 0, 0],
            [1, 0, Math.PI / 2],
            [0, 1, -Math.PI / 2]
        ].forEach(([column, row, rotation]) => {
            const x = xBeginning + column * dotSize * (count - 7)
            const y = yBeginning + row * dotSize * (count - 7)
            let cornersSquareMask = this.dotsMask
            let cornersSquareMaskGroup = this.dotsMaskGroup
            let cornersDotMask = this.dotsMask
            let cornersDotMaskGroup = this.dotsMaskGroup

            if (options.cornersSquareOptions?.gradient || options.cornersSquareOptions?.color) {
                [cornersSquareMask, cornersSquareMaskGroup] = this.createMask(`mask-corners-square-color-${column}-${row}`)
                this.defs.appendChild(cornersSquareMask)
                cornersDotMask = cornersSquareMask
                cornersDotMaskGroup = cornersSquareMaskGroup

                this.createColor({
                    options: options.cornersSquareOptions?.gradient,
                    color: options.cornersSquareOptions?.color,
                    additionalRotation: rotation,
                    x,
                    y,
                    height: cornersSquareSize,
                    width: cornersSquareSize,
                    name: `corners-square-color-${column}-${row}`
                })
            }

            const squareArgs: DrawArgs = {
                x,
                y,
                size: cornersSquareSize,
                document: this.options.document,
                rotation
            }
            const pluinCornerSquare = options.plugins?.length ? drawPluginCornerSquare(options.plugins)(squareArgs) : undefined

            if (pluinCornerSquare) {
                const [cornerElement, cornerFill] = pluinCornerSquare

                if (cornersSquareMaskGroup) {
                    cornersSquareMaskGroup.appendChild(cornerElement)
                }

                if (this.lightDotsMaskGroup) {
                    this.lightDotsMaskGroup.appendChild(cornerFill)
                }
            } else if (isCornerSquareType(options.cornersSquareOptions?.type)) {
                const draw = getQrCornerSquareFigure(options.cornersSquareOptions.type)

                const [cornerElement, cornerFill] = draw(squareArgs)

                if (cornersSquareMaskGroup) {
                    cornersSquareMaskGroup.appendChild(cornerElement)
                }

                if (this.lightDotsMaskGroup) {
                    this.lightDotsMaskGroup.appendChild(cornerFill)
                }
            } else {
                const draw = getQrDotFigure(options.cornersSquareOptions?.type || options.dotsOptions.type, options.plugins)

                for (let i = 0; i < squareMask.length; i++) {
                    for (let j = 0; j < squareMask[i].length; j++) {
                        if (!squareMask[i]?.[j]) {
                            if (this.lightDotsMask && !dotMask[i]?.[j]) {
                                if (this.lightDotsMaskGroup) {
                                    this.lightDotsMaskGroup.appendChild(draw({
                                        x: x + i * dotSize,
                                        y: y + j * dotSize,
                                        size: dotSize,
                                        document: this.options.document,
                                        getNeighbor: (xOffset: number, yOffset: number): boolean =>
                                            !squareMask[i + xOffset]?.[j + yOffset] && !dotMask[i + xOffset]?.[j + yOffset]
                                    }))
                                }
                            }
                            continue
                        }

                        if (cornersSquareMaskGroup) {
                            cornersSquareMaskGroup.appendChild(draw({
                                x: x + i * dotSize,
                                y: y + j * dotSize,
                                size: dotSize,
                                document: this.options.document,
                                getNeighbor: (xOffset: number, yOffset: number): boolean => !!squareMask[i + xOffset]?.[j + yOffset]
                            }))
                        }
                    }
                }

                if (this.lightDotsMask)
                    for (let i = -1; i < 8; i++) {
                        for (let j = -1; j < 8; j++) {
                            if (i == -1 || i == 7 || j == -1 || j == 7) {
                                if (this.lightDotsMaskGroup) {
                                    this.lightDotsMaskGroup.appendChild(draw({
                                        x: x + i * dotSize,
                                        y: y + j * dotSize,
                                        size: dotSize,
                                        document: this.options.document,
                                        getNeighbor: (xOffset: number, yOffset: number): boolean => {
                                            const ii = i + xOffset
                                            const jj = j + yOffset
                                            return ii >= -1 && ii <= 7 && jj >= -1 && jj <= 7 && (ii == -1 || ii == 7 || jj == -1 || jj == 7)
                                        }
                                    }))
                                }
                            }
                        }
                    }
            }

            if (options.cornersDotOptions?.gradient || options.cornersDotOptions?.color) {
                [cornersDotMask, cornersDotMaskGroup] = this.createMask(`mask-corners-dot-color-${column}-${row}`)
                this.defs.appendChild(cornersDotMask)

                this.createColor({
                    options: options.cornersDotOptions?.gradient,
                    color: options.cornersDotOptions?.color,
                    additionalRotation: rotation,
                    x: x + dotSize * 2,
                    y: y + dotSize * 2,
                    height: cornersDotSize,
                    width: cornersDotSize,
                    name: `corners-dot-color-${column}-${row}`
                })
            }

            const dotArgs: DrawArgs = {
                x: x + dotSize * 2,
                y: y + dotSize * 2,
                size: cornersDotSize,
                document: this.document,
                rotation
            }
            const pluinCornerDot = options.plugins?.length ? drawPluginCornerDot(options.plugins)(dotArgs) : undefined

            if (pluinCornerDot) {
                if (cornersDotMaskGroup) {
                    cornersDotMaskGroup.appendChild(pluinCornerDot)
                }
            } else if (isCornerDotType(options.cornersDotOptions?.type)) {
                const draw = getQrCornerDotFigure(options.cornersDotOptions.type)

                if (cornersDotMaskGroup) {
                    cornersDotMaskGroup.appendChild(draw(dotArgs))
                }
            } else {
                const draw = getQrDotFigure(options.cornersDotOptions?.type || options.dotsOptions.type, options.plugins)

                for (let i = 0; i < dotMask.length; i++) {
                    for (let j = 0; j < dotMask[i].length; j++) {
                        if (!dotMask[i]?.[j]) {
                            continue
                        }

                        if (cornersDotMaskGroup) {
                            cornersDotMaskGroup.appendChild(draw({
                                x: x + i * dotSize,
                                y: y + j * dotSize,
                                size: dotSize,
                                document: this.options.document,
                                getNeighbor: (xOffset: number, yOffset: number): boolean => !!dotMask[i + xOffset]?.[j + yOffset]
                            }))
                        }
                    }
                }
            }
        })
    }

    async drawImage({
        width,
        height,
        count,
        dotSize
    }: {
        width: number
        height: number
        count: number
        dotSize: number
    }): Promise<void> {
        const options = this.options
        const xBeginning = Math.floor((options.width - count * dotSize) / 2)
        const yBeginning = Math.floor((options.height - count * dotSize) / 2)
        let margin = options.imageOptions.margin * dotSize
        if (options.imageOptions.mode == ImageMode.background) margin = 0
        const dx = xBeginning + margin + (count * dotSize - width) / 2
        const dy = yBeginning + margin + (count * dotSize - height) / 2
        const dw = width - margin * 2
        const dh = height - margin * 2

        const imageUrl = await this.imageTools.toDataURL(options.image || '')
        let image: SVGElement = this.document.createElementNS('http://www.w3.org/2000/svg', 'image')
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

        image.setAttribute('x', numToAttr(dx))
        image.setAttribute('y', numToAttr(dy))
        image.setAttribute('width', `${numToAttr(dw)}px`)
        image.setAttribute('height', `${numToAttr(dh)}px`)

        this._element.appendChild(image)
    }

    private createColor({
        options,
        color,
        additionalRotation,
        x,
        y,
        height,
        width,
        name
    }: {
        options?: Gradient
        color?: string
        additionalRotation: number
        x: number
        y: number
        height: number
        width: number
        name: string
    }): void {
        const gradientSize = width > height ? width : height

        x -= this.options.dotsOptions.size
        y -= this.options.dotsOptions.size
        width += 2 * this.options.dotsOptions.size
        height += 2 * this.options.dotsOptions.size

        const rect = this.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', numToAttr(x))
        rect.setAttribute('y', numToAttr(y))
        rect.setAttribute('height', numToAttr(height))
        rect.setAttribute('width', numToAttr(width))
        rect.setAttribute('style', `mask:url(#mask-${name})`)

        if (options) {
            let gradient: SVGElement
            if (options.type === GradientType.radial) {
                gradient = this.document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')
                gradient.setAttribute('id', name)
                gradient.setAttribute('gradientUnits', 'userSpaceOnUse')
                gradient.setAttribute('fx', numToAttr(x + width / 2))
                gradient.setAttribute('fy', numToAttr(y + height / 2))
                gradient.setAttribute('cx', numToAttr(x + width / 2))
                gradient.setAttribute('cy', numToAttr(y + height / 2))
                gradient.setAttribute('r', numToAttr(gradientSize / 2))
            } else {
                const rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI)
                const positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI)
                let x0 = x + width / 2
                let y0 = y + height / 2
                let x1 = x + width / 2
                let y1 = y + height / 2

                if (
                    (positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
                    (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)
                ) {
                    x0 = x0 - width / 2
                    y0 = y0 - (height / 2) * Math.tan(rotation)
                    x1 = x1 + width / 2
                    y1 = y1 + (height / 2) * Math.tan(rotation)
                } else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
                    y0 = y0 - height / 2
                    x0 = x0 - width / 2 / Math.tan(rotation)
                    y1 = y1 + height / 2
                    x1 = x1 + width / 2 / Math.tan(rotation)
                } else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
                    x0 = x0 + width / 2
                    y0 = y0 + (height / 2) * Math.tan(rotation)
                    x1 = x1 - width / 2
                    y1 = y1 - (height / 2) * Math.tan(rotation)
                } else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
                    y0 = y0 + height / 2
                    x0 = x0 + width / 2 / Math.tan(rotation)
                    y1 = y1 - height / 2
                    x1 = x1 - width / 2 / Math.tan(rotation)
                }

                gradient = this.document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
                gradient.setAttribute('id', name)
                gradient.setAttribute('gradientUnits', 'userSpaceOnUse')
                gradient.setAttribute('x1', numToAttr(x0))
                gradient.setAttribute('y1', numToAttr(y0))
                gradient.setAttribute('x2', numToAttr(x1))
                gradient.setAttribute('y2', numToAttr(y1))
            }

            options.colorStops.forEach((stopCfg: { offset: number, color: string }) => {
                const stop = this.document.createElementNS('http://www.w3.org/2000/svg', 'stop')
                stop.setAttribute('offset', `${numToAttr(100 * stopCfg.offset)}%`)

                const parsed = parseColor(stopCfg.color)
                stop.setAttribute('stop-color', parsed.value)
                if (parsed.alpha < 1) stop.setAttribute('stop-opacity', parsed.alpha.toFixed(7))
                gradient.appendChild(stop)
            })

            rect.setAttribute('fill', `url(#${name})`)
            this.defs.appendChild(gradient)
        } else if (color) {
            const parsed = parseColor(color)
            rect.setAttribute('fill', parsed.value)
            if (parsed.alpha < 1) rect.setAttribute('opacity', parsed.alpha.toFixed(7))
        }

        this._element.appendChild(rect)
    }

    private createMask(id: string) {
        const options = this.options

        const mask = this.document.createElementNS('http://www.w3.org/2000/svg', 'mask')
        mask.setAttribute('id', id)
        mask.setAttribute('maskUnits', 'userSpaceOnUse')
        mask.setAttribute('x', '0')
        mask.setAttribute('y', '0')
        mask.setAttribute('width', numToAttr(options.width))
        mask.setAttribute('height', numToAttr(options.height))

        const group = this.document.createElementNS('http://www.w3.org/2000/svg', 'g')
        group.setAttribute('fill', '#fff')
        mask.appendChild(group)

        return [mask, group]
    }
}
