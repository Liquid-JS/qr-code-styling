import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { calculateImageSize } from './image.js'

@suite('Test calculateImageSizeForAxis function')
export class ImageTest {
    @test('The function should return an correct result for 0 sizes')
    noSizes() {
        expect(
            calculateImageSize({
                originalHeight: 0,
                originalWidth: 0,
                maxHiddenDots: 0,
                dotSize: 0,
                margin: 0
            })
        ).to.deep.equal({
            height: 0,
            width: 0,
            hideYDots: 0,
            hideXDots: 0
        })
    }

    @test('The function should return an correct result for minus values')
    minusValues() {
        expect(
            calculateImageSize({
                originalHeight: -1,
                originalWidth: 5,
                maxHiddenDots: 11,
                dotSize: -5,
                margin: 0
            })
        ).to.deep.equal({
            height: 0,
            width: 0,
            hideYDots: 0,
            hideXDots: 0
        })
    }

    @test('The function should return an correct result for small images')
    smallImages() {
        expect(
            calculateImageSize({
                originalHeight: 20,
                originalWidth: 10,
                maxHiddenDots: 1,
                dotSize: 10,
                margin: 0
            })
        ).to.deep.equal({
            height: 10,
            width: 5,
            hideYDots: 1,
            hideXDots: 1
        })
    }

    @test('The function should return an correct result for small images, if height is smaller than width')
    verticalImages() {
        expect(
            calculateImageSize({
                originalHeight: 10,
                originalWidth: 20,
                maxHiddenDots: 1,
                dotSize: 10,
                margin: 0
            })
        ).to.deep.equal({
            height: 5,
            width: 10,
            hideYDots: 1,
            hideXDots: 1
        })
    }

    @test('The function should return an correct result for large images')
    largeImages() {
        expect(
            calculateImageSize({
                originalHeight: 1000,
                originalWidth: 2020,
                maxHiddenDots: 50,
                dotSize: 10,
                margin: 0
            })
        ).to.deep.equal({
            height: 45,
            width: 90,
            hideYDots: 5,
            hideXDots: 9
        })
    }

    @test('Use the maxHiddenAxisDots value for x')
    maxHiddenX() {
        expect(
            calculateImageSize({
                originalHeight: 1000,
                originalWidth: 2020,
                maxHiddenDots: 50,
                dotSize: 10,
                maxHiddenAxisDots: 1,
                margin: 0
            })
        ).to.deep.equal({
            height: 5,
            width: 10,
            hideYDots: 1,
            hideXDots: 1
        })
    }

    @test('Use the maxHiddenAxisDots value for y')
    maxHiddenY() {
        expect(
            calculateImageSize({
                originalHeight: 2020,
                originalWidth: 1000,
                maxHiddenDots: 50,
                dotSize: 10,
                maxHiddenAxisDots: 1,
                margin: 0
            })
        ).to.deep.equal({
            height: 10,
            width: 5,
            hideYDots: 1,
            hideXDots: 1
        })
    }

    @test('Use the maxHiddenAxisDots value for y with even value')
    maxHiddenEven() {
        expect(
            calculateImageSize({
                originalHeight: 2020,
                originalWidth: 1000,
                maxHiddenDots: 50,
                dotSize: 10,
                maxHiddenAxisDots: 2,
                margin: 0
            })
        ).to.deep.equal({
            height: 10,
            width: 5,
            hideYDots: 1,
            hideXDots: 1
        })
    }
}
