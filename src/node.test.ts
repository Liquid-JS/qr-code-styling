import { readFile } from 'node:fs/promises'
import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { QRCodeStyling } from './node.js'

@suite('Node')
export class NodeTest {
    @test('A code without an image renders to SVG')
    async withoutImage() {
        const svg = await new QRCodeStyling({ data: 'https://example.com' }).serialize()
        expect(svg).to.match(/<svg[\s>]/)
        expect(svg).not.to.contain('<image')
    }

    @test('A code with an image embeds it, loading what images need on first use')
    async withImage() {
        const image = await readFile(new URL('./assets/facebook.png', import.meta.url))
        const svg = await new QRCodeStyling({ data: 'https://example.com', image }).serialize()
        expect(svg).to.contain('<image')
        expect(svg).to.contain('data:image/png;base64,')
    }
}
