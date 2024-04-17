import { ZodFormattedError, z } from "zod";

export const zd = (zod: z.Schema) => (
  value: any,
  { kind }: DecoratorContext
) => {
  if (
    (kind === "method" || kind === "setter") &&
    zod instanceof z.ZodFunction
  ) {
    return zod.implement(value);
  }
};

export const recursiveMessages = (
  obj: ZodFormattedError<any>,
  prefix: string | null = null
): string[] => {
  return Object.keys(obj).reduce((acc, key) => {
    if (key === "_errors") {
      return [
        ...acc,
        ...obj._errors.map((error) =>
          prefix !== null ? `Issue with ${prefix}: ${error}` : error
        ),
      ];
    } else {
      return [
        ...acc,
        ...recursiveMessages(
          // @ts-expect-error
          obj[key],
          prefix !== null ? `${prefix}.${key}` : key
        ),
      ];
    }
  }, [] as string[]);
};

export const difference = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  if (Set.prototype.hasOwnProperty("difference")) {
    // @ts-ignore
    return setA.difference(setB);
  } else {
    const ret = new Set<T>();

    setA.forEach((item) => {
      if (!setB.has(item)) {
        ret.add(item);
      }
    });

    return ret;
  }
};

declare global {
  interface Array<T> {
    remove: <T>(item: T) => void;
  }
}

Array.prototype.remove = function(item) {
  this.splice(this.indexOf(item), 1);
};