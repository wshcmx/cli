import ts from 'typescript';

export function noDeclarationInLoop(onDiagnostic: (diagnostic: ts.Diagnostic) => void): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile: ts.SourceFile) => {
    let loopDepth = 0;

    function visit(node: ts.Node): ts.Node {
      // Track when we enter a loop
      const isLoop = ts.isForStatement(node) ||
        ts.isForOfStatement(node) ||
        ts.isForInStatement(node) ||
        ts.isWhileStatement(node) ||
        ts.isDoStatement(node);

      if (isLoop) {
        loopDepth++;
      }

      // Check if this is a variable declaration inside a loop
      if (loopDepth > 0 && ts.isVariableStatement(node)) {
        const flags = ts.getCombinedNodeFlags(node.declarationList);
        const kind = flags & ts.NodeFlags.Const
          ? "const"
          : flags & ts.NodeFlags.Let
            ? "let"
            : "var";

        onDiagnostic({
          file: sourceFile,
          start: node.getStart(sourceFile),
          length: node.getWidth(sourceFile),
          messageText: `Variable declaration (${kind}) not allowed inside loop`,
          category: ts.DiagnosticCategory.Error,
          code: 9001,
        });
      }

      const result = ts.visitEachChild(node, visit, context);

      // Track when we exit a loop
      if (isLoop) {
        loopDepth--;
      }

      return result;
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  }
}