import ts from 'typescript';

export function transformNamespaces(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isModuleDeclaration(node) && (node.flags & ts.NodeFlags.Namespace)) {
        if (node.body && ts.isModuleBlock(node.body)) {
          const statements = node.body.statements.map((statement) => ts.visitNode(statement, visit) as ts.Statement);
          const customString = ts.factory.createExpressionStatement(ts.factory.createStringLiteral(`META:NAMESPACE:${node.name.text}`));
          node = [customString, ...statements] as unknown as ts.Node;
        }
      }

      return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}