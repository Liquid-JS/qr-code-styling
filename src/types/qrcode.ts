type TypeNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40;

const TypeNumber = Array(41)
  .fill(0)
  .map((_, i) => i) as unknown as {
  [P in TypeNumber]: P;
};

export { TypeNumber };

export enum ErrorCorrectionLevel {
  L = "L",
  M = "M",
  Q = "Q",
  H = "H"
}

export enum Mode {
  numeric = "Numeric",
  alphanumeric = "Alphanumeric",
  byte = "Byte",
  kanji = "Kanji",
  unicode = "Unicode"
}

export interface QRCode {
  addData(data: string, mode?: Mode.alphanumeric | Mode.byte | Mode.kanji | Mode.numeric): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}
