import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "rollup-plugin-typescript2";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "./lib/qr-code-styling.js",
      sourcemap: true,
      format: "umd",
      name: "QRCodeStyling"
    },
    plugins: [typescript(), commonjs(), nodeResolve(), terser()]
  },
  {
    input: "src/node.ts",
    output: {
      file: "./lib/qr-code-styling-node.js",
      sourcemap: true,
      format: "cjs"
    },
    plugins: [typescript(), commonjs()]
  }
];
