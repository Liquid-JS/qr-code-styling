import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { defaultOptions } from './options.js'

@suite('Test default QROptions')
export class OptionsTest {
    @test('The export of the module should be an object')
    isObject() {
        expect(typeof defaultOptions).to.equal('object')
    }

    @test('Test the content of options')
    keys() {
        const optionsKeys = ['data', 'qrOptions', 'imageOptions', 'dotsOptions']
        optionsKeys.forEach((key) => {
            expect(Object.keys(defaultOptions)).to.contain(key, 'The options should contain particular keys')
        })
    }
}
