/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import compiler from "@liquid-js/rollup-plugin-closure-compiler";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { RollupOptions } from "rollup";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import replace from "rollup-plugin-replace-regex";
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
    plugins: [
      typescript(),
      commonjs(),
      nodeResolve(),
      compiler({
        language_in: "ECMASCRIPT_2020",
        language_out: "ECMASCRIPT_2020"
      }) as any,
      terser()
    ]
  },
  {
    input: "src/kanji.ts",
    output: {
      file: "./lib/kanji.js",
      sourcemap: true,
      format: "esm",
      name: "Kanji"
    },
    plugins: [
      typescript(),
      commonjs(),
      nodeResolve(),
      compiler({
        language_in: "ECMASCRIPT_2020",
        language_out: "ECMASCRIPT_2020"
      }) as any,
      terser()
    ]
  },
  {
    input: "src/node.ts",
    output: {
      file: "./lib/qr-code-styling-node.js",
      sourcemap: true,
      format: "esm"
    },
    plugins: [
      typescript(),
      commonjs(),
      compiler({
        language_in: "ECMASCRIPT_2020",
        language_out: "ECMASCRIPT_2020",
        formatting: "PRETTY_PRINT",
        debug: "true"
      }) as any,
      replace({
        regexValues: {
          "\\$([a-zA-Z0-9_]*(\\$\\d+)?)(\\$[\\w$]*?)?\\$\\$": (_, m) => {
            return m.replace(/\$([a-zA-Z0-9_]*(\$\d+)?)(\$[\w$]*?)?\$\$/, "$1");
          }
        },
        preventAssignment: false,
        delimiters: ["", ""]
      }),
      terser({ mangle: false, ecma: 2020, output: { beautify: true } })
    ]
  }
];

export default config;
