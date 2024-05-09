export interface CanvasOptions {
  width: number;
  height: number;
  margin: number;
}

export const defaultCanvasOptions: CanvasOptions = {
  width: 300,
  height: 300,
  margin: 0
};

export function sanitizeCanvasOptions(options: CanvasOptions): CanvasOptions {
  const newOptions = { ...options };

  newOptions.width = Number(newOptions.width);
  newOptions.height = Number(newOptions.height);
  newOptions.margin = Number(newOptions.margin);

  if (newOptions.margin > Math.min(newOptions.width, newOptions.height)) {
    newOptions.margin = Math.min(newOptions.width, newOptions.height);
  }

  return newOptions;
}
