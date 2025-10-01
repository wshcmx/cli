import ts from 'typescript';

export function noDeclarationInLoop(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node) {
      // Check if this is a variable declaration inside a loop
      if (ts.isVariableStatement(node)) {
        const parent = node.parent;
        if (
          parent &&
          ts.isBlock(parent) &&
          (
            ts.isForStatement(parent.parent) ||
            ts.isForOfStatement(parent.parent) ||
            ts.isForInStatement(parent.parent) ||
            ts.isWhileStatement(parent.parent) ||
            ts.isDoStatement(parent.parent)
          )
        ) {
          const flags = ts.getCombinedNodeFlags(node.declarationList);
          const kind = flags & ts.NodeFlags.Const
            ? "const"
            : flags & ts.NodeFlags.Let
              ? "let"
              : "var";

          throw new Error(
            `Variable declaration (${kind}) not allowed inside loop`
          );
        }
      }

      return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  }
}