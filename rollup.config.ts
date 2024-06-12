/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import compiler from "@liquid-js/rollup-plugin-closure-compiler";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { RollupOptions } from "rollup";
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals";
import replace from "rollup-plugin-replace-regex";
import typescript from "rollup-plugin-typescript2";

const common = () => [
  typescript(),
  commonjs(),
  minifyTemplateLiterals({
    options: {
      shouldMinify: () => true
    }
  })
];

const bundle = () => [
  nodeResolve(),
  compiler({
    language_in: "ECMASCRIPT_2020",
    language_out: "ECMASCRIPT_2020"
  }) as any,
  terser()
];

const config: RollupOptions[] = [
  {
    input: "src/index.ts",
    output: {
      file: "./lib/qr-code-styling.js",
      sourcemap: true,
      format: "esm",
      name: "QRCodeStyling"
    },
    plugins: [...common(), ...bundle()]
  },
  {
    input: "src/kanji.ts",
    output: {
      file: "./lib/kanji.js",
      sourcemap: true,
      format: "esm",
      name: "Kanji"
    },
    plugins: [...common(), ...bundle()]
  },
  {
    input: "src/node.ts",
    output: {
      file: "./lib/qr-code-styling-node.js",
      sourcemap: true,
      format: "esm"
    },
    plugins: [
      ...common(),
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
