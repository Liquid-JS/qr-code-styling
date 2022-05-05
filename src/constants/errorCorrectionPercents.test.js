import { ErrorCorrectionPercents } from "./errorCorrectionPercents";

describe("Error Correction Percents", () => {
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
