import ts from "typescript";

export const compileDebug = async (source: string) => {
  // const doTransform = () => {
  //   const expressions: [position: number, statement: string][] = []

  //   const transform = <T extends ts.Node>(): ts.TransformerFactory<T> => {
      

  //       return (node) => ts.visitNode(node, visit) as T;
  //     };
  //   };

  //   const transpiled = ts.transpileModule(source, {
  //     compilerOptions: { module: ts.ModuleKind.CommonJS },
  //     transformers: { before: [transform()] },
  //   })

  //   return {
  //     text: transpiled.outputText
  //   }
  // };

  // const transpiled = doTransform(ts)

  // const compiled = `
  //   const checkStopped = async () => null

  //   async executeDebug = async function*() {
  //     const run = function(index, expression) {
  //       do {
  //         const consoleInput = await checkStopped()
  //         if (consoleInput !== null && consoleInput !== '') expression(consoleInput)
  //       } while (consoleInput !== null)

  //       return expression(expressions[index])
  //     }
  //     ${
  //       transpiled.text
  //     }
  //   }
  // `;
  // return [compiled];
};
