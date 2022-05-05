import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/node.ts',
    output: {
        file: './lib/qr-code-styling-node.js',
        sourcemap: true,
        format: 'cjs'
    },
    plugins: [typescript(), commonjs()]
};