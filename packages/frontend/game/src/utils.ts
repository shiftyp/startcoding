import FastestValidator, { ValidationSchema } from 'fastest-validator'
export const validate = (...schema: Array<string | ValidationSchema>) => function <Value>(
  this: any,
  value: Value,
  context?: DecoratorContext
): Value {
  // @ts-ignore
  const v = schema.length && schema[schema.length - 1] instanceof FastestValidator ? schema.pop() as FastestValidator : new FastestValidator()

  const mapInput = function (this: any, input: ValidationSchema | string) {
    if (typeof input === 'string' || input.hasOwnProperty('type')) {
      if (typeof input !== 'string' && input.type === 'tuple') {
        return {
          ...input,
          items: input.items.map(mapInput)
        }
      } else {
        return input
      }
    } else {
      return {
        $$type: 'object',
        ...Object.keys(input).reduce((acc, key) => {
          const current = mapInput(input[key])
          acc[key] = current
          return acc
        }, {} as Record<string, ValidationSchema | string>)
      }
    }
  }

  const check = v.compile({
      arguments: {
        type: 'tuple',
        empty: schema.every(item => {
          // @ts-expect-error
          return item.hasOwnProperty('optional') && item.optional === true
        }),
        items: schema.map(mapInput)
      }
    })

  if (
    !context || (context.kind === "method" || context.kind === "setter")
  ) {
    return function (this: any, ...args: any[]) {
      const validation = check({ arguments: args }, {
        meta: {
          target: this
        }
      })
      if (Array.isArray(validation)) {
        throw new TypeError(validation.map(({ message }) => message).join('\n'))
      }
      // @ts-expect-error
      return value.apply(this, args)
    } as Value;
  } else if (context && context.kind === 'class') {
    // @ts-expect-error
    return class Validated extends value {
      constructor(...args: any[]) {
        super(...args)
        const validation = check({ arguments: args }, {
          meta: {
            target: this
          }
        })
        if (Array.isArray(validation)) {
          throw new TypeError(validation.map(({ message }) => message).join('\n'))
        }
      }
    }
  }

  return value
};

export const difference = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  if (Set.prototype.hasOwnProperty("difference")) {
    // @ts-expect-error
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

Array.prototype.remove = function (item) {
  this.splice(this.indexOf(item), 1);
};