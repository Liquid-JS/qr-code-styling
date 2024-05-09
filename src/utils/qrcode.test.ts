import { Mode } from "../types/qrcode.js";
import { ErrorCorrectionPercents, getMode } from "./qrcode.js";

describe("Test getMode function", () => {
  it("Return numeric mode if a string with numbers is passed", () => {
    expect(getMode("123")).toBe(Mode.numeric);
  });

  it("Return alphanumeric mode if a string with particular symbols is passed", () => {
    expect(getMode("01ABCZ$%*+-./:01ABCZ$%*+-./:")).toBe(Mode.alphanumeric);
  });

  it("Return byte mode if a string with all keyboard symbols is passed", () => {
    expect(getMode("01ABCZ./:!@#$%^&*()_+01ABCZ./:!@#$%^&*()_'+|\\")).toBe(Mode.byte);
  });

  it("Return byte mode if a string with Cyrillic symbols is passed", () => {
    expect(getMode("абвАБВ")).toBe(Mode.unicode);
  });

  it("The export of the module should be an object", () => {
    expect(typeof ErrorCorrectionPercents).toBe("object");
  });

  it.each(Object.values(ErrorCorrectionPercents))("Values should be numbers", (value) => {
    expect(typeof value).toBe("number");
  });

  it.each(Object.keys(ErrorCorrectionPercents))("Allowed only particular keys", (key) => {
    expect(["L", "M", "Q", "H"]).toContain(key);
  });
});
