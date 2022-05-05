import * as index from "./index";

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
    "default"
  ])("The module should export certain submodules", (moduleName) => {
    expect(Object.keys(index)).toContain(moduleName);
  });
});
