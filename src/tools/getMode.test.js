import { getMode } from "./getMode";
import { Mode } from "../types";

describe("Test getMode function", () => {
  it("Return numeric mode if numbers is passed", () => {
    expect(getMode(123)).toBe(Mode.numeric);
  });
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
});
