import { Mode } from '@liquid-js/qrcode-generator/lib/qrcode/QRCodeMinimal.js'
import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { ErrorCorrectionPercents, getMode } from './qrcode.js'

@suite('Test getMode function')
export class GetMode {
    @test('Return numeric mode if a string with numbers is passed')
    numeric() {
        expect(getMode('123')).to.equal(Mode.numeric)
    }

    @test('Return alphanumeric mode if a string with particular symbols is passed')
    alphanum() {
        expect(getMode('01ABCZ$%*+-./:01ABCZ$%*+-./:')).to.equal(Mode.alphanumeric)
    }

    @test('Return byte mode if a string with all keyboard symbols is passed')
    byte() {
        expect(getMode("01ABCZ./:!@#$%^&*()_+01ABCZ./:!@#$%^&*()_'+|\\")).to.equal(Mode.byte)
    }

    @test('Return byte mode if a string with Cyrillic symbols is passed')
    unicode() {
        expect(getMode('абвАБВ')).to.equal(Mode.unicode)
    }

    @test('The export of the module should be an object')
    exports() {
        expect(typeof ErrorCorrectionPercents).to.equal('object')
    }

    @test('Values should be numbers')
    eccValues() {
        Object.values(ErrorCorrectionPercents).forEach((value) => {
            expect(typeof value).to.equal('number')
        })
    }

    @test('Allowed only particular keys')
    limitedKeys() {
        Object.keys(ErrorCorrectionPercents).forEach((key) => {
            expect(['L', 'M', 'Q', 'H']).to.contain(key)
        })
    }
}
