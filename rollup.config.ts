import compiler from '@liquid-js/rollup-plugin-closure-compiler'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { type RollupOptions } from 'rollup'
import { minifyTemplateLiterals } from 'rollup-plugin-minify-template-literals'

const common = () => [
    typescript({
        declaration: true,
        declarationDir: './lib/',
        inlineSources: true,
        tsconfig: 'tsconfig.lib.json'
    }),
    commonjs(),
    minifyTemplateLiterals({
        options: {
            shouldMinify: () => true
        }
    })
]

const bundle = () => [
    nodeResolve(),
    compiler({
        language_in: 'ECMASCRIPT_NEXT',
        language_out: 'ECMASCRIPT_NEXT'
    }),
    terser()
]

export default new Array<RollupOptions>(
    {
        input: {
            'qr-code-styling': 'src/index.ts',
            'kanji': 'src/kanji.ts',
            'plugin-utils': 'src/plugins/utils.ts',
            'border-plugin': 'src/plugins/border.ts'
        },
        output: {
            dir: './lib',
            sourcemap: true,
            format: 'esm',
            name: 'QRCodeStyling'
        },
        plugins: [...common(), ...bundle()]
    },
    {
        input: 'src/node.ts',
        output: {
            file: './lib/qr-code-styling-node.js',
            sourcemap: true,
            format: 'esm'
        },
        plugins: [
            ...common(),
            compiler({
                language_in: 'ECMASCRIPT_NEXT',
                language_out: 'ECMASCRIPT_NEXT',
                formatting: 'PRETTY_PRINT',
                compilation_level: 'WHITESPACE_ONLY'
            }),
            terser({ mangle: false, ecma: 2024 as any, output: { beautify: true } })
        ]
    }
)
