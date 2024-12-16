/* eslint-disable @typescript-eslint/no-require-imports */
const { pathToFileURL } = require("url");
const { register } = require("module");
process.env.TS_NODE_PROJECT = "tsconfig.test.json";
register("ts-node-maintained/esm", pathToFileURL("./"));

require("source-map-support/register.js");
require("jsdom-global")(undefined, { resources: "usable", pretendToBeVisual: true });

global.XMLSerializer = global.window.XMLSerializer;
global.atob = (data) => Buffer.from(data, "base64").toString("binary");

// Better Set inspection for failed tests

Set.prototype.inspect = function () {
  return `Set { ${Array.from(this.values()).join(", ")} }`;
};
