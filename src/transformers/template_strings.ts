import ts from "typescript";

export function convertTemplateStrings(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isTemplateExpression(node)) {
        const expressions: ts.Expression[] = [ts.factory.createStringLiteral(node.head.text)];

        node.templateSpans.forEach(span => {
          expressions.push(span.expression);
          expressions.push(ts.factory.createStringLiteral(span.literal.text));
        });

        let concatenated: ts.Expression = expressions[0];

        for (let i = 1; i < expressions.length; i++) {
          concatenated = ts.factory.createBinaryExpression(
            concatenated,
            ts.SyntaxKind.PlusToken,
            expressions[i]
          );
        }

        return concatenated;
      }

      return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}