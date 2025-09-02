import compiler from '@liquid-js/rollup-plugin-closure-compiler'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { type RollupOptions } from 'rollup'
import { minifyTemplateLiterals } from 'rollup-plugin-minify-template-literals'
import replace from 'rollup-plugin-replace-regex'

const repl = replace({
    regexValues: {
        '\\$([a-zA-Z0-9_]*(\\$\\d+)?)(\\$[\\w$]*?)?\\$\\$': (_, m) => m.replace(/\$([a-zA-Z0-9_]*(\$\d+)?)(\$[\w$]*?)?\$\$/, '$1')
    },
    preventAssignment: false,
    delimiters: ['', '']
})
// @ts-expect-error hidden api
repl.renderChunk = repl.__renderChunk

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
        input: 'src/index.ts',
        output: {
            file: './lib/qr-code-styling.js',
            sourcemap: true,
            format: 'esm',
            name: 'QRCodeStyling'
        },
        plugins: [...common(), ...bundle()]
    },
    {
        input: 'src/kanji.ts',
        output: {
            file: './lib/kanji.js',
            sourcemap: true,
            format: 'esm',
            name: 'Kanji'
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
                debug: 'true'
            }),
            repl,
            terser({ mangle: false, ecma: 2024 as any, output: { beautify: true } })
        ]
    }
)
