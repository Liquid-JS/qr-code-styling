import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { mergeDeep } from './merge.js'

const simpleObject = {
    str: 'foo'
}

const objectWithArray = {
    arr: [1, 2]
}

const nestedObject = {
    obj: {
        foo: 'foo'
    }
}

const nestedObjectWithArray = {
    obj: {
        arr: [1, 2]
    }
}

@suite('Test merge function')
export class TestMarge {
    @test('Merge two objects')
    mergeTwo() {
        expect(mergeDeep(simpleObject, { str: 'bar' })).to.deep.equal({ str: 'bar' })
    }

    @test('Merge two objects with arrays')
    objectWithArray() {
        expect(mergeDeep(objectWithArray, { arr: [3, 4] })).to.deep.equal({ arr: [3, 4] })
    }

    @test('Merge two objects with nested objects')
    nested() {
        expect(mergeDeep(nestedObject, { obj: { bar: 'bar' } })).to.deep.equal({ obj: { foo: 'foo', bar: 'bar' } })
    }

    @test('Merge three objects with nested objects')
    multiNested() {
        expect(mergeDeep(nestedObjectWithArray, nestedObject, { obj: { arr: [3, 4] } })).to.deep.equal({
            obj: {
                foo: 'foo',
                arr: [3, 4]
            }
        })
    }

    @test("Don't mutate target")
    immutable() {
        const target = {
            str: 'foo'
        }

        expect(mergeDeep(target, { str: 'bar' })).to.not.equal(target)
    }

    @test('Skip undefined sources')
    skipUndefined() {
        expect(mergeDeep(simpleObject, undefined)).to.equal(simpleObject)
    }

    @test('Merge array items')
    mergeArray() {
        const simpleArray = [1, 2]

        expect(mergeDeep(simpleArray, [3, 4])).to.deep.equal(simpleArray)
    }
}
