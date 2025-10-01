import ts from 'typescript';

export function noDeclarationInLoop(onDiagnostic: (diagnostic: ts.Diagnostic) => void): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
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

          onDiagnostic({
            file: sourceFile,
            start: node.getStart(),
            length: node.getWidth(),
            messageText: `Variable declaration (${kind}) not allowed inside loop`,
            category: ts.DiagnosticCategory.Error,
            code: 9001,
          });
        }
      }

      return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  }
}