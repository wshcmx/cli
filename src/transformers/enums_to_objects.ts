import ts from 'typescript';

export function enumsToObjects(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isEnumDeclaration(node)) {
        const members = node.members.map((member, index) => {
          const name = member.name;
          const initializer = member.initializer || ts.factory.createNumericLiteral(index);
          return ts.factory.createPropertyAssignment(name, initializer);
        });

        return ts.factory.createVariableStatement(
          [],
          [
            ts.factory.createVariableDeclaration(
              node.name,
              undefined,
              undefined,
              ts.factory.createObjectLiteralExpression(members, true)
            )
          ]
        );
      }

      return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}
