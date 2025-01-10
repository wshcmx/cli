import ts from "typescript";

export function removeExports(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isFunctionDeclaration(node) && node.modifiers) {
        node = ts.factory.updateFunctionDeclaration(
          node,
          [],
          node.asteriskToken,
          node.name,
          node.typeParameters,
          node.parameters,
          node.type,
          node.body,
        );
      }
    
      if (ts.isExportDeclaration(node)) {//} && node.modifiers) {
        // try {
        //   console.log(node.getFullText());
        // } catch (e) {}
        // node = ts.factory.updateExportDeclaration(
        //   node as ts.ExportDeclaration,
        //   [],
        //   true,
        //   undefined,
        //   undefined,
        //   undefined,
        // );
      }
    
      // if (ts.isImportDeclaration(node)) {
      //   node = ts.factory.updateImportDeclaration(
      //     node,
      //     [],
      //     node.importClause,
      //     node.moduleSpecifier,
      //     node.attributes
      //   );
      // }

      // if (ts.isTypeAliasDeclaration(node) && node.modifiers) {
      //   const modifiers = node.modifiers.filter(mod => mod.kind !== ts.SyntaxKind.ExportKeyword);
      //   node = ts.factory.updateTypeAliasDeclaration(
      //     node,
      //     modifiers,
      //     node.name,
      //     node.typeParameters,
      //     node.type
      //   );
      // }

      // if (ts.isVariableStatement(node) && node.modifiers) {
      //   const modifiers = node.modifiers.filter(mod => mod.kind !== ts.SyntaxKind.ExportKeyword);
      //   node = ts.factory.updateVariableStatement(
      //     node,
      //     modifiers,
      //     node.declarationList
      //   );
      // }

      return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}