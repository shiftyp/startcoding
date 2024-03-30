import ts from "typescript";
import { getGameIndex } from "@startcoding/game";

export const compileIndex = async (source: string) => {
  const index = await getGameIndex("javascript");
  const compiled = `${index}\r\n\nconst execute = () => {\r\n\r\n//User Code\r\n\r\n${source}\r\n}\r\n`;
  return [compiled];
};
export const compileDebug = async (source: string) => {
  const index = await getGameIndex("javascript");

  const transform = <T extends ts.Node>(): ts.TransformerFactory<T> => {
    return (context) => {
      const visit: ts.Visitor = (node) => {
        const next = (nextNode) => ts.visitEachChild(nextNode, child => visit(child), context)
        if (ts.isExpressionStatement(node)) {
          const statementSource = ts.createSourceFile(
            "tmp",
            `
              await run(\`${node.getFullText().replace("`", "\\`")}\`).bind(this)
            `,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.JS
          );
          return statementSource
            .getChildAt(0, statementSource)
            .getChildAt(0, statementSource);
        } else if (ts.isArrowFunction(node)) {
          const statementSource = ts.createSourceFile(
            "tmp",
            `
              async () => {
                ${ts.visitEachChild(node, (child) => visit(child), context)}
              }
            `,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.JS
          );
          return statementSource
            .getChildAt(0, statementSource)
            .getChildAt(0, statementSource);
        } else if (ts.isVariableDeclaration(node)) {
          const nodeText = node.getFullText()
          const assignmentStart = nodeText.lastIndexOf(node.getChildAt(1).getFullText())
          const statementSource = ts.createSourceFile(
            "tmp",
            `
              ${nodeText.substring(0, assignmentStart) + next(node.getChildAt(1)).getFullText()}
            `,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.JS
          );
          return statementSource
            .getChildAt(0, statementSource)
            .getChildAt(0, statementSource);
        }

        return next(node)
      };

      return (node) => ts.visitNode(node, visit) as T;
    };
  };

  const compiled = `
    const checkStopped = async () => null

    async execute = async () => {
      const run = function(expression) {
        do {
          const consoleInput = await checkStopped()
          if (consoleInput !== null && consoleInput !== '') eval(consoleInput)
        } while (consoleInput !== null)

        return eval(expression)
      }
      ${
        ts.transpileModule(source, {
          compilerOptions: { module: ts.ModuleKind.CommonJS },
          transformers: { before: [transform()] },
        }).outputText
      }
    }
  `;
  return [compiled];
};
