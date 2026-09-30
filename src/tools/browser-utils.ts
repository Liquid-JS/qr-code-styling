import { QRCodeStyling } from '../core/qr-code-styling.js'
import { RecursivePartial } from '../types/helper.js'
import { CanvasOptions, defaultCanvasOptions, sanitizeCanvasOptions } from '../utils/canvas-options.js'
import { mergeDeep } from '../utils/merge.js'
import { lanczosResize } from './resize.js'

export enum FileExtension {
    svg = 'svg',
    png = 'png',
    jpeg = 'jpeg',
    webp = 'webp'
}

export function drawToCanvas(
    qrCode: QRCodeStyling,
    options?: RecursivePartial<CanvasOptions>
): { canvas: HTMLCanvasElement, canvasDrawingPromise: Promise<void> | undefined } | undefined {
    const { width, height, margin } = options
        ? sanitizeCanvasOptions(mergeDeep(defaultCanvasOptions, options) as CanvasOptions)
        : defaultCanvasOptions

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const size = Math.min(width, height) - 2 * margin

    const canvasDrawingPromise = qrCode.serialize().then((xml) => {
        if (!xml) return

        const container = new DOMParser().parseFromString(xml, 'text/xml')
        const rootEl = Array.from(container.getElementsByTagName('svg'))
        if (!rootEl.length) return
        const svg = rootEl[0]
        const viewBox = svg.getAttribute('viewBox') || ''
        const imgW = parseFloat(svg.getAttribute('width') || '0')
        const imgH = parseFloat(svg.getAttribute('height') || '0')
        if (!imgW || !imgH)
            return

        // Ensure pixel-perfect rendering of SVG to avoid artefact, then downscale to requested size
        const aaFactor = Math.ceil((2 * size) / Math.min(imgW, imgH))
        svg.setAttribute('width', (aaFactor * imgW).toFixed())
        svg.setAttribute('height', (aaFactor * imgH).toFixed())

        const serializer = new XMLSerializer()
        let source = serializer.serializeToString(svg)

        source = '<?xml version="1.0" standalone="no"?>\r\n' + source

        const svg64 = btoa(source)
        const image64 = 'data:image/svg+xml;base64,' + svg64
        const image = new Image()

        return new Promise<void>((resolve, reject) => {
            image.onload = (): void => {
                const [x, y, w, h] = viewBox.split(/\s+/g).map(parseFloat).map(v => v * aaFactor)
                const dx = ((x % 1) + 1) % 1
                const dy = ((y % 1) + 1) % 1
                let aaCanvas: HTMLCanvasElement | OffscreenCanvas
                try {
                    aaCanvas = new OffscreenCanvas(Math.ceil(w + dx + 2), Math.ceil(h + dy + 2))
                } catch (_) {
                    // Fallback to regular canvas element
                    aaCanvas = document.createElement('canvas')
                    aaCanvas.width = Math.ceil(w + dx + 2)
                    aaCanvas.height = Math.ceil(h + dy + 2)
                }
                aaCanvas.getContext('2d')?.drawImage(image, dx + 1, dy + 1, w, h)
                const imgData = lanczosResize(aaCanvas, {
                    width: width - 2 * margin,
                    height: height - 2 * margin
                })

                canvas?.getContext('2d')?.putImageData(imgData, margin, margin)
                resolve()
            }
            image.onerror = image.onabort = reject

            image.src = image64
        })
    })

    return { canvas, canvasDrawingPromise }
}

export async function download(
    qrCode: QRCodeStyling,
    downloadOptions?: { name?: string, extension: `${FileExtension}` },
    options?: RecursivePartial<CanvasOptions>
): Promise<void> {
    let extension: `${FileExtension}` = FileExtension.png
    let name = 'qr'

    if (downloadOptions) {
        if (downloadOptions.name) {
            name = downloadOptions.name
        }
        if (downloadOptions.extension) {
            extension = downloadOptions.extension
        }
    }

    if (extension.toLowerCase() === 'svg') {
        const source = await qrCode.serialize()
        if (!source) return
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
        downloadURI(url, `${name}.svg`)
    } else {
        const res = drawToCanvas(qrCode, options)
        if (!res) return
        const { canvas, canvasDrawingPromise } = res
        await canvasDrawingPromise
        const url = canvas.toDataURL(`image/${extension}`)
        downloadURI(url, `${name}.${extension}`)
    }
}

export function downloadURI(uri: string, name: string): void {
    const link = document.createElement('a')
    link.download = name
    link.href = uri
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
