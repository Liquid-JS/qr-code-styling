import { defaultOptions } from "./QROptions.js";

describe("Test default QROptions", () => {
  it("The export of the module should be an object", () => {
    expect(typeof defaultOptions).toBe("object");
  });

  describe("Test the content of options", () => {
    const optionsKeys = ["data", "qrOptions", "imageOptions", "dotsOptions"];
    it.each(optionsKeys)("The options should contain particular keys", (key) => {
      expect(Object.keys(defaultOptions)).toContain(key);
    });
  });
});
