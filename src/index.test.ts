import * as index from "./index.js";

describe("Index", () => {
  it.each([
    "ErrorCorrectionPercents",
    "QRCodeStyling",
    "DotType",
    "CornerDotType",
    "CornerSquareType",
    "GradientType",
    "ShapeType",
    "TypeNumber",
    "ErrorCorrectionLevel",
    "Mode",
    "browserUtils"
  ])("The module should export certain submodules", (moduleName) => {
    expect(Object.keys(index)).toContain(moduleName);
  });
});
