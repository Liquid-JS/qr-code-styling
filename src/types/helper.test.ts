import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { Options } from '../utils/options.js'
import { RecursivePartial } from './helper.js'

// The checks are the types: each `@ts-expect-error` fails the compile if the value it's on is accepted.
@suite('Test RecursivePartial')
export class RecursivePartialTest {
    @test('A group that can also be false takes a partial group')
    partialUnion() {
        const background: RecursivePartial<Options> = { backgroundOptions: { gradient: { colorStops: [{ color: '#fff' }] } } }
        const none: RecursivePartial<Options> = { backgroundOptions: false }
        expect([background, none]).to.have.length(2)
    }

    @test('Functions, files and documents are taken whole')
    wholeValues() {
        const options: RecursivePartial<Options> = {
            image: new Blob([]),
            stringToBytesFuncs: { SJIS: (s: string) => [s.length] }
        }
        // @ts-expect-error a file isn't a group of options
        const image: RecursivePartial<Options> = { image: { size: 1 } }
        // @ts-expect-error a function isn't a group of options
        const encoding: RecursivePartial<Options> = { stringToBytesFuncs: { SJIS: {} } }
        // @ts-expect-error a document isn't a group of options
        const document: RecursivePartial<Options> = { document: { title: '' } }
        expect([options, image, encoding, document]).to.have.length(4)
    }
}
