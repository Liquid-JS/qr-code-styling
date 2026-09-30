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
        const viewBox = xml.match(/viewBox="([^"]+)"/i)![1].split(/\s+/g).map(parseFloat)

        // Ensure pixel-perfect rendering of SVG to avoid artefact, then downscale to requested size
        const aaFactor = Math.ceil((2 * size) / Math.min(viewBox[2], viewBox[3]))
        const [x, y, w, h] = viewBox.map(v => v * aaFactor)
        const dx = ((x % 1) + 1) % 1
        const dy = ((y % 1) + 1) % 1

        const container = new DOMParser().parseFromString(xml, 'text/xml')
        const rootEl = Array.from(container.getElementsByTagName('svg'))
        if (!rootEl.length) return
        const svg = rootEl[0]
        svg.setAttribute('width', w.toFixed(10))
        svg.setAttribute('height', h.toFixed(10))

        const serializer = new XMLSerializer()
        let source = serializer.serializeToString(svg)

        source = '<?xml version="1.0" standalone="no"?>\r\n' + source

        const svg64 = btoa(source)
        const image64 = 'data:image/svg+xml;base64,' + svg64
        const image = new Image()

        return new Promise<void>((resolve, reject) => {
            image.onload = (): void => {
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
    options?: RecursivePartial<CanvasOptions>,
    share = false
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

    let url: string
    if (extension.toLowerCase() === 'svg') {
        const source = await qrCode.serialize()
        if (!source) return
        url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
    } else {
        const res = drawToCanvas(qrCode, options)
        if (!res) return
        const { canvas, canvasDrawingPromise } = res
        await canvasDrawingPromise
        url = canvas.toDataURL(`image/${extension}`)
    }

    const blob = await (await fetch(url)).blob()
    downloadURI(blob, `${name}.${extension}`, share)
}

export function downloadURI(uri: string | Blob, name: string, share = false): void {
    const isBlob = uri instanceof Blob
    if (uri instanceof Blob) {
        if (share) {
            const file = new File([uri], name, { type: uri.type })
            if (navigator.canShare?.({ files: [file] })) {
                try {
                    navigator.share({ files: [file] }).catch((err) => console.warn(err))
                    return
                } catch (err) {
                    console.error(err)
                }
            }
        }
        uri = URL.createObjectURL(uri)
    }
    const link = document.createElement('a')
    link.download = name
    link.href = uri
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    if (isBlob)
        setTimeout(() => URL.revokeObjectURL(uri), 60_000)
}
