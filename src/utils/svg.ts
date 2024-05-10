const rx = /\.?0+$/;

export function numToAttr(value: number) {
  return value.toFixed(7).replace(rx, "");
}
