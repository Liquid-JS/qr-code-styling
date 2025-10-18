import { BasicFigureDrawArgs } from '../types/helper.js'
import { svgPath } from '../utils/svg.js'

export const SquareElements = {
    dot: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const dotSize = size / 7

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute('clip-rule', 'evenodd')
        element.setAttribute(
            'd',
            svgPath`M ${x + size / 2} ${y}
          a ${size / 2} ${size / 2} 0 1 0 0.1 0
          z
          m 0 ${dotSize}
          a ${size / 2 - dotSize} ${size / 2 - dotSize} 0 1 1 -0.1 0
          Z`
        )

        const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        fill.setAttribute('clip-rule', 'evenodd')
        fill.setAttribute(
            'd',
            svgPath`M ${x + size / 2} ${y - dotSize}
          a ${size / 2 + dotSize} ${size / 2 + dotSize} 0 1 0 0.1 0
          z`
        )

        return [element, fill] as const
    },
    square: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const dotSize = size / 7

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute('clip-rule', 'evenodd')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y}
          v ${size}
          h ${size}
          v ${-size}
          z
          M ${x + dotSize} ${y + dotSize}
          h ${size - 2 * dotSize}
          v ${size - 2 * dotSize}
          h ${-size + 2 * dotSize}
          z`
        )

        const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        fill.setAttribute('clip-rule', 'evenodd')
        fill.setAttribute(
            'd',
            svgPath`M ${x - dotSize} ${y - dotSize}
          h ${size + 2 * dotSize}
          v ${size + 2 * dotSize}
          h ${-size - 2 * dotSize}
          z`
        )

        return [element, fill] as const
    },
    extraRounded: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const dotSize = size / 7

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute('clip-rule', 'evenodd')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y + 2.5 * dotSize}
          v ${2 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize} 0 0 0 ${dotSize * 2.5} ${dotSize * 2.5}
          h ${2 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize} 0 0 0 ${dotSize * 2.5} ${-dotSize * 2.5}
          v ${-2 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize} 0 0 0 ${-dotSize * 2.5} ${-dotSize * 2.5}
          h ${-2 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize} 0 0 0 ${-dotSize * 2.5} ${dotSize * 2.5}
          z
          M ${x + 2.5 * dotSize} ${y + dotSize}
          h ${2 * dotSize}
          a ${1.5 * dotSize} ${1.5 * dotSize} 0 0 1 ${dotSize * 1.5} ${dotSize * 1.5}
          v ${2 * dotSize}
          a ${1.5 * dotSize} ${1.5 * dotSize} 0 0 1 ${-dotSize * 1.5} ${dotSize * 1.5}
          h ${-2 * dotSize}
          a ${1.5 * dotSize} ${1.5 * dotSize} 0 0 1 ${-dotSize * 1.5} ${-dotSize * 1.5}
          v ${-2 * dotSize}
          a ${1.5 * dotSize} ${1.5 * dotSize} 0 0 1 ${dotSize * 1.5} ${-dotSize * 1.5}
          z`
        )

        const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        fill.setAttribute('clip-rule', 'evenodd')
        fill.setAttribute(
            'd',
            svgPath`
          M ${x - dotSize} ${y + 2.5 * dotSize}
          v ${2 * dotSize}
          a ${3.5 * dotSize} ${3.5 * dotSize} 0 0 0 ${dotSize * 3.5} ${dotSize * 3.5}
          h ${2 * dotSize}
          a ${3.5 * dotSize} ${3.5 * dotSize} 0 0 0 ${dotSize * 3.5} ${-dotSize * 3.5}
          v ${-2 * dotSize}
          a ${3.5 * dotSize} ${3.5 * dotSize} 0 0 0 ${-dotSize * 3.5} ${-dotSize * 3.5}
          h ${-2 * dotSize}
          a ${3.5 * dotSize} ${3.5 * dotSize} 0 0 0 ${-dotSize * 3.5} ${dotSize * 3.5}
          z`
        )

        return [element, fill] as const
    },
    classy: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const dotSize = size / 7

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute('clip-rule', 'evenodd')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y + 2.5 * dotSize}
          v ${2 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize} 0 0 0 ${dotSize * 2.5} ${dotSize * 2.5}
          h ${4.5 * dotSize}
          v ${-4.5 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize} 0 0 0 ${-dotSize * 2.5} ${-dotSize * 2.5}
          h ${-2 * dotSize}
          H ${x}
          z
          M ${x + 2.5 * dotSize} ${y + dotSize}
          h ${2 * dotSize}
          a ${1.5 * dotSize} ${1.5 * dotSize} 0 0 1 ${dotSize * 1.5} ${dotSize * 1.5}
          v ${3.5 * dotSize}
          h ${-3.5 * dotSize}
          a ${1.5 * dotSize} ${1.5 * dotSize} 0 0 1 ${-dotSize * 1.5} ${-dotSize * 1.5}
          v ${-3.5 * dotSize}
          z`
        )

        const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        fill.setAttribute('clip-rule', 'evenodd')
        fill.setAttribute(
            'd',
            svgPath`
          M ${x + 0.5 * dotSize} ${y - dotSize}
          h ${4 * dotSize}
          a ${3.5 * dotSize} ${3.5 * dotSize} 0 0 1 ${dotSize * 3.5} ${dotSize * 3.5}
          v ${5.5 * dotSize}
          h ${-5.5 * dotSize}
          a ${3.5 * dotSize} ${3.5 * dotSize} 0 0 1 ${-dotSize * 3.5} ${-dotSize * 3.5}
          v ${-5.5 * dotSize}
          z`
        )

        return [element, fill] as const
    },
    inpoint: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const dotSize = size / 7

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute('clip-rule', 'evenodd')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y + 2.5 * dotSize}
          v ${2 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize} 0 0 0 ${dotSize * 2.5} ${dotSize * 2.5}
          h ${4.5 * dotSize}
          v ${-4.5 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize} 0 0 0 ${-dotSize * 2.5} ${-dotSize * 2.5}
          h ${-2 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize} 0 0 0 ${-dotSize * 2.5} ${dotSize * 2.5}
          z
          M ${x + 2.5 * dotSize} ${y + dotSize}
          h ${2 * dotSize}
          a ${1.5 * dotSize} ${1.5 * dotSize} 0 0 1 ${dotSize * 1.5} ${dotSize * 1.5}
          v ${3.5 * dotSize}
          h ${-3.5 * dotSize}
          a ${1.5 * dotSize} ${1.5 * dotSize} 0 0 1 ${-dotSize * 1.5} ${-dotSize * 1.5}
          v ${-2 * dotSize}
          a ${1.5 * dotSize} ${1.5 * dotSize} 0 0 1 ${dotSize * 1.5} ${-dotSize * 1.5}
          z`
        )

        const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        fill.setAttribute('clip-rule', 'evenodd')
        fill.setAttribute(
            'd',
            svgPath`
          M ${x + 0.5 * dotSize} ${y - dotSize}
          h ${4 * dotSize}
          a ${3.5 * dotSize} ${3.5 * dotSize} 0 0 1 ${dotSize * 3.5} ${dotSize * 3.5}
          v ${5.5 * dotSize}
          h ${-5.5 * dotSize}
          a ${3.5 * dotSize} ${3.5 * dotSize} 0 0 1 ${-dotSize * 3.5} ${-dotSize * 3.5}
          v ${-2 * dotSize}
          a ${3.5 * dotSize} ${3.5 * dotSize} 0 0 1 ${dotSize * 3.5} ${-dotSize * 3.5}
          z`
        )

        return [element, fill] as const
    },
    centerCircle: (args: BasicFigureDrawArgs) => {
        const { x, y, size } = args

        const circleRadius = size / 2.5
        const cx = x + size / 2
        const cy = y + size / 2
        const dotSize = size / 7

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute('clip-rule', 'evenodd')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y}
          h ${size}
          v ${size}
          h ${-size}
          z
          M ${cx - circleRadius} ${cy}
          a ${circleRadius} ${circleRadius} 0 1 0 ${circleRadius * 2} 0
          a ${circleRadius} ${circleRadius} 0 1 0 ${-circleRadius * 2} 0
          z`
        )

        const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        fill.setAttribute('clip-rule', 'evenodd')
        fill.setAttribute(
            'd',
            svgPath`M ${x - dotSize} ${y - dotSize}
          h ${size + 2 * dotSize}
          v ${size + 2 * dotSize}
          h ${-size - 2 * dotSize}
          z`
        )

        return [element, fill] as const
    }
}
