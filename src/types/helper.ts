export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

export type DrawArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
  getNeighbor?: (x: number, y: number) => boolean;
};

export type BasicFigureDrawArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
};

export type RotateFigureArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
  draw: () => void;
};
