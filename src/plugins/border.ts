import { Options, Plugin } from '../utils/options.js'
import { extendSVG, numToAttr, svgPath } from './utils.js'

enum TextPosition {
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right'
}

export interface BorderConfig {
    size: number
    color: string
    dasharray?: string
    margin?: number
}

export interface TextConfig {
    font?: string
    color?: string
    size?: number
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
    fontStyle?: 'normal' | 'italic' | 'oblique'
}

export interface BorderPluginOptions extends BorderConfig {
    /** Border roundnes, from 0 (square) to 1 (circle) */
    round?: number
    text: TextConfig & {
        [key in TextPosition]?: TextConfig & {
            content: string
        }
    }
    innerBorder?: BorderConfig
    outerBorder?: BorderConfig
}

export class BorderPlugin implements Plugin {

    constructor(private readonly pluginOptions: BorderPluginOptions, private readonly id = Math.random().toFixed(10).substring(2)) { }

    postProcess(svg: SVGSVGElement, options: Options) {
        const { document } = options
        const thickness = (
            this.pluginOptions.size + (this.pluginOptions.margin || 0)
            + (this.pluginOptions.innerBorder?.size || 0) + (this.pluginOptions.innerBorder?.margin || 0)
            + (this.pluginOptions.outerBorder?.size || 0) + (this.pluginOptions.outerBorder?.margin || 0)
        )
        const vb = extendSVG(svg, thickness)
        if (!vb)
            return

        const cx = (vb.left * 2 + vb.right) / 2
        const cy = (vb.top * 2 + vb.bottom) / 2
        const lineSize = Math.min(options.width, options.height) / 2 * (1 - (this.pluginOptions.round || 0))
        let r = (Math.min(vb.right - 2 * thickness, vb.bottom - 2 * thickness) / 2) - lineSize

        const drawBorder = (cfg: BorderConfig) => {
            const t = cfg.size
            const mid = r += (cfg.margin || 0) + t / 2
            const pathR = this.pluginOptions.round ? r : 0
            const pathL = this.pluginOptions.round ? lineSize : lineSize + r
            r += t / 2

            const element = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            element.setAttribute('width', numToAttr((pathL + pathR) * 2))
            element.setAttribute('height', numToAttr((pathL + pathR) * 2))
            element.setAttribute('x', numToAttr(cx - pathL - pathR))
            element.setAttribute('y', numToAttr(cy - pathL - pathR))
            element.setAttribute('rx', numToAttr(pathR))
            element.setAttribute('fill', 'none')
            element.setAttribute('stroke', cfg.color)
            element.setAttribute('stroke-width', numToAttr(t))
            if (cfg.dasharray) {
                element.setAttribute('stroke-dasharray', cfg.dasharray)
            }

            svg.appendChild(element)
            return mid
        }

        if (this.pluginOptions.innerBorder) {
            drawBorder(this.pluginOptions.innerBorder)
        }

        const textRadius = drawBorder(this.pluginOptions)

        if (this.pluginOptions.outerBorder) {
            drawBorder(this.pluginOptions.outerBorder)
        }

        [TextPosition.left, TextPosition.top, TextPosition.right, TextPosition.bottom].forEach(postion => {
            const config = this.pluginOptions.text[postion]
            if (config) {
                let defs = Array.from(svg.childNodes).find(v => (v as HTMLElement).tagName.toUpperCase() == 'DEFS')
                if (!defs) {
                    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
                    svg.appendChild(defs)
                }
                const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                const size = (config.size || this.pluginOptions.text.size || 1)
                let pathR = this.pluginOptions.round ? textRadius - size / 3 : 0
                let pathL = this.pluginOptions.round ? lineSize : lineSize + (textRadius - size / 3)
                switch (postion) {
                    case TextPosition.top:
                        element.setAttribute(
                            'd',
                            svgPath`M ${cx} ${cy + pathR + pathL}
                          h ${-pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${-pathR}
                          v ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${-pathR}
                          h ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${pathR}
                          v ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${pathR}
                          h ${-pathL}`
                        )
                        break
                    case TextPosition.bottom:
                        if (this.pluginOptions.round)
                            pathR += size * 2 / 3
                        else
                            pathL += size * 2 / 3
                        element.setAttribute(
                            'd',
                            svgPath`M ${cx} ${cy - pathR - pathL}
                          h ${-pathL}
                          a ${pathR} ${pathR} 0 0 0 ${-pathR} ${pathR}
                          v ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 0 ${pathR} ${pathR}
                          h ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 0 ${pathR} ${-pathR}
                          v ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 0 ${-pathR} ${-pathR}
                          h ${-pathL}`
                        )
                        break
                    case TextPosition.left:
                        element.setAttribute(
                            'd',
                            svgPath`M ${cx + pathR + pathL} ${cy}
                          v ${pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${pathR}
                          h ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${-pathR}
                          v ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${-pathR}
                          h ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${pathR}
                          v ${pathL}`
                        )
                        break
                    case TextPosition.right:
                        element.setAttribute(
                            'd',
                            svgPath`M ${cx - pathR - pathL} ${cy}
                          v ${-pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${-pathR}
                          h ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${pathR}
                          v ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${pathR}
                          h ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${-pathR}
                          v ${-pathL}`
                        )
                        break
                }
                const id = `border-text-${postion}-${this.id}`
                element.setAttribute('id', id)
                element.setAttribute('fill', 'none')

                const span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
                span.setAttribute('font-family', config.font || this.pluginOptions.text.font || 'sans-serif')
                span.setAttribute('fill', config.color || this.pluginOptions.text.color || '#000')
                span.setAttribute('font-weight', numToAttr(config.fontWeight || this.pluginOptions.text.fontWeight || 'normal'))
                span.setAttribute('font-style', config.fontStyle || this.pluginOptions.text.fontStyle || 'normal')
                span.setAttribute('font-size', numToAttr(size))
                span.textContent = config.content

                const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath')
                textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id)
                textPath.setAttribute('startOffset', '50%')
                textPath.setAttribute('text-anchor', 'middle')
                textPath.appendChild(span)

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                text.appendChild(textPath)

                defs.appendChild(element)
                svg.appendChild(text)
            }
        })
    }
}
