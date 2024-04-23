import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { RollupOptions } from "rollup";
import typescript from "rollup-plugin-typescript2";

const config: RollupOptions[] = [
  {
    input: "src/index.ts",
    output: {
      file: "./lib/qr-code-styling.js",
      sourcemap: true,
      format: "esm",
      name: "QRCodeStyling"
    },
    plugins: [typescript(), commonjs(), nodeResolve(), terser()]
  },
  {
    input: "src/node.ts",
    output: {
      file: "./lib/qr-code-styling-node.js",
      sourcemap: true,
      format: "esm"
    },
    plugins: [typescript(), commonjs()]
  }
];

export default config;
