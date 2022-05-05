import { Mode } from "../types";

export function getMode(data: string): Mode {
  switch (true) {
    case /^[0-9]*$/.test(data):
      return Mode.numeric;
    case /^[0-9A-Z $%*+\-./:]*$/.test(data):
      return Mode.alphanumeric;
    default:
      return Mode.byte;
  }
}
