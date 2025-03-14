import ts from 'typescript';

export function convertTemplateStrings(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isTemplateExpression(node)) {
        let expression: ts.Expression | undefined;

        if (node.head.text.length > 0) {
          expression = ts.factory.createStringLiteral(node.head.text);
        }

        for (const span of node.templateSpans) {
          const visitedExpression = ts.visitNode(span.expression, visit) as ts.Expression;

          if (!expression) {
            expression = visitedExpression;
          } else {
            expression = ts.factory.createBinaryExpression(expression, ts.SyntaxKind.PlusToken, visitedExpression);
          }

          if (span.literal.text.length > 0) {
            expression = ts.factory.createBinaryExpression(
              expression,
              ts.SyntaxKind.PlusToken,
              ts.factory.createStringLiteral(span.literal.text)
            );
          }
        }

        return expression ?? ts.factory.createStringLiteral('');
      }

      return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}