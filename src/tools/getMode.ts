import { Mode } from "../types/index.js";

export function getMode(data: string): Mode {
  switch (true) {
    case /^[0-9]*$/.test(data):
      return Mode.numeric;
    case /^[0-9A-Z $%*+\-./:]*$/.test(data):
      return Mode.alphanumeric;
    // eslint-disable-next-line no-control-regex
    case /[^\u0000-\u00ff]/.test(data):
      return Mode.unicode;
    default:
      return Mode.byte;
  }
}
