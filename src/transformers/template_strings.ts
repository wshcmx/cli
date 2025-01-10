import ts from 'typescript';

export function convertTemplateStrings(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isTemplateExpression(node)) {
        let result: ts.Expression = ts.factory.createStringLiteral(node.head.text);

        node.templateSpans.forEach(span => {
          const expression = ts.visitNode(span.expression, visit) as ts.Expression;
          const literal = ts.factory.createStringLiteral(span.literal.text);

          result = ts.factory.createBinaryExpression(
            ts.factory.createBinaryExpression(result, ts.SyntaxKind.PlusToken, expression),
            ts.SyntaxKind.PlusToken,
            literal
          );
        });

        return result;
      }

      return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}