import { QRCodeMinimal } from '@liquid-js/qrcode-generator/lib/qrcode/QRCodeMinimal.js'
import { stringToBytes_UTF8 } from '@liquid-js/qrcode-generator/lib/text/stringToBytes_UTF8.js'
import { RecursivePartial } from '../types/helper.js'
import { mergeDeep } from '../utils/merge.js'
import { AppliedMask, GeneratorMask, ImageMode, Options, ShapeType, defaultOptions, sanitizeOptions } from '../utils/options.js'
import { ErrorCorrectionPercents, getMode } from '../utils/qrcode.js'
import { QRSVG } from './qr-svg.js'

Object.assign(QRCodeMinimal.stringToBytesFuncs, stringToBytes_UTF8)

export type ExtensionFunction = (svg: SVGSVGElement, options: Options) => void

export class QRCodeStyling {
    private options: Options
    private container?: HTMLElement
    private qr?: QRCodeMinimal
    private extension?: ExtensionFunction
    private svgDrawingPromise?: Promise<void>
    private qrSVG?: QRSVG

    get size() {
        if (this.qrSVG)
            return {
                width: this.qrSVG.width,
                height: this.qrSVG.height
            }
        return undefined
    }

    constructor(options?: RecursivePartial<Options>) {
        this.options = options ? sanitizeOptions(mergeDeep(defaultOptions, options) as Options) : defaultOptions
        this.update()
    }

    update(
        /** The same options as for initialization */
        options?: RecursivePartial<Options>
    ): void {
        if (this.container) this.container.innerHTML = ''

        this.options = options ? sanitizeOptions(mergeDeep(this.options, options) as Options) : this.options

        const plugins = this.options.plugins
        plugins?.forEach(p => {
            if ('configure' in p && p.configure) {
                const modified = p.configure(this.options)
                if (modified) {
                    this.options = sanitizeOptions(modified)
                }
            }
        })

        if (!this.options.data) {
            return
        }

        if (this.options.stringToBytesFuncs) {
            Object.assign(QRCodeMinimal.stringToBytesFuncs, this.options.stringToBytesFuncs)
            delete this.options.stringToBytesFuncs
        }

        this.qr = new QRCodeMinimal(this.options.qrOptions.typeNumber, this.options.qrOptions.errorCorrectionLevel)
        const mode = this.options.qrOptions.mode || getMode(this.options.data)
        this.qr.addData(this.options.data, mode)
        this.qr.make()

        this.setupSvg()

        this.append(this.container)
    }

    append(
        /** This container will be used for appending of the QR code */
        container?: HTMLElement
    ): void {
        if (!container) {
            return
        }

        if (this.qrSVG?.element) {
            container.appendChild(this.qrSVG.element)
        }

        this.container = container
    }

    /**
     * @deprecated Use options.plugins with a postProcess hook
     * @example
     *
     * ```js
     * const extension = (svg, options) => {
     *   const { width, height } = options;
     *   const size = Math.min(width, height);
     *   const border = options.document.createElementNS("http://www.w3.org/2000/svg", "rect");
     *   const borderAttributes = {
     *     fill: "none",
     *     x: (width - size + 40) / 2,
     *     y: (height - size + 40) / 2,
     *     width: size - 40,
     *     height: size - 40,
     *     stroke: "black",
     *     "stroke-width": 40,
     *     rx: 100
     *   };
     *   Object.keys(borderAttributes).forEach((attribute) => {
     *     border.setAttribute(attribute, borderAttributes[attribute]);
     *   });
     *   svg.appendChild(border);
     * };
     * ```
     */
    applyExtension(
        /** Extension is a function that takes svg and previously applied options and modifies an svg */
        extension: ExtensionFunction
    ): void {
        if (!extension) {
            throw new Error('Extension function should be defined.')
        }

        this.extension = extension
        this.update()
    }

    /**
     * @deprecated Use options.plugins with a postProcess hook
     */
    deleteExtension(): void {
        this.extension = undefined
        this.update()
    }

    async serialize(): Promise<string | undefined> {
        if (!this.qr) throw new Error('QR code is empty')

        if (!this.qrSVG?.element || !this.svgDrawingPromise) {
            this.setupSvg()
        }
        await this.svgDrawingPromise

        if (!this.qrSVG?.element) {
            return
        }

        const serializer = new XMLSerializer()
        let source = serializer.serializeToString(this.qrSVG.element)

        source = '<?xml version="1.0" standalone="no"?>\r\n' + source
        return source
    }

    private setupSvg(): void {
        if (!this.qr) {
            return
        }
        let moduleCount = this.qr.getModuleCount()
        const isBackground = this.options.imageOptions.mode == ImageMode.background
        // Room for the light border in ImageMode.background
        const padding = isBackground ? 1 : 0

        let mask: GeneratorMask | undefined
        for (const plugin of this.options.plugins || []) {
            mask = plugin.applyMask?.(moduleCount, padding) || undefined
            if (mask) break
        }

        if (mask) {
            const { startX, startY } = mask
            const columns = mask.mask.slice(startX, startX + moduleCount)
            if (
                startX < padding ||
                startY < padding ||
                startX + moduleCount + padding > mask.mask.length ||
                columns.length < moduleCount ||
                columns.some((col) => startY + moduleCount + padding > col.length)
            )
                throw new Error(padding ? `The mask must extend ${padding} segment(s) beyond the QR code on each side` : 'The QR code must lie inside the mask')

            const corners = [[0, 0], [moduleCount - 7, 0], [0, moduleCount - 7]]
            if (corners.some(([x, y]) => columns.slice(x, x + 7).some((col) => col.slice(startY + y, startY + y + 7).some((v) => !v))))
                throw new Error('The QR code corners must not be hidden by the mask')
        }

        let size: number
        let appliedMask: AppliedMask | undefined
        if (mask) {
            // The code is drawn at [0, 0] in its original size (plus border and margin in ImageMode.background),
            // the remaining segments outside the viewBox
            const dotSize = this.options.dotsOptions.size
            const margin = isBackground ? 1 + (this.options.imageOptions.margin || 0) : 0
            size = Math.ceil(dotSize * (moduleCount + 2 * margin))
            const beginning = Math.floor((size - moduleCount * dotSize) / 2)
            appliedMask = {
                ...mask,
                count: moduleCount,
                dotSize,
                x: beginning - mask.startX * dotSize,
                y: beginning - mask.startY * dotSize
            }
        } else {
            if (this.options.imageOptions.mode == ImageMode.background && this.options.shape != ShapeType.circle)
                moduleCount += 2
            let count = Math.ceil((this.options.shape == ShapeType.circle ? Math.sqrt(2) : 1) * moduleCount)
            if (count % 2 == 0) count -= 1
            let margin = (this.options.backgroundOptions && this.options.backgroundOptions.margin) || 0
            if (this.options.imageOptions.mode == ImageMode.background) margin += this.options.imageOptions.margin || 0
            size = Math.ceil(this.options.dotsOptions.size * (count + 2 * margin))
        }

        this.qrSVG = new QRSVG({
            ...this.options,
            ...(mask && { shape: ShapeType.square, backgroundOptions: undefined }),
            width: size,
            height: size,
            size,
            mask,
            errorCorrectionPercent: ErrorCorrectionPercents[this.options.qrOptions.errorCorrectionLevel]
        })

        this.svgDrawingPromise = this.qrSVG.drawQR(this.qr).then(async () => {
            if (!this.qrSVG?.element) return
            if (this.options.plugins)
                for (const plugin of this.options.plugins) {
                    await plugin.postProcess?.(this.qrSVG!.element!, {
                        ...this.options,
                        width: size,
                        height: size,
                        size,
                        mask: appliedMask
                    }, {
                        dots: this.qrSVG?.dotsColor,
                        background: this.qrSVG?.backgroundColor
                    })
                }
            this.extension?.(this.qrSVG.element, {
                ...this.options,
                width: size,
                height: size,
                size,
                mask: appliedMask
            })
        })
    }
}
