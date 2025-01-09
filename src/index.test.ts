import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import * as index from './index.js'

@suite('Index')
export class IndexTest {
    @test('The module should export certain submodules')
    exportsAll() {
        [
            'ErrorCorrectionPercents',
            'QRCodeStyling',
            'DotType',
            'CornerDotType',
            'CornerSquareType',
            'GradientType',
            'ShapeType',
            'TypeNumber',
            'ErrorCorrectionLevel',
            'Mode',
            'browserUtils'
        ].forEach((moduleName) => expect(Object.keys(index)).to.contain(moduleName))
    }
}
