import ts from 'typescript';

import { args, ArgsFlags } from '../core/args.js';

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

      if (ts.isExportDeclaration(node) && node.modifiers) {
        node = ts.factory.updateExportDeclaration(
          node as ts.ExportDeclaration,
          [],
          true,
          undefined,
          undefined,
          undefined,
        );
      }

      if (ts.isImportDeclaration(node)) {
        if (args.has(ArgsFlags.RETAIN_IMPORTS_AS_COMMENTS)) {
          const commentedStatement = ts.factory.createNotEmittedStatement(node);
          ts.addSyntheticLeadingComment(
            commentedStatement,
            ts.SyntaxKind.SingleLineCommentTrivia,
            ` ${node.getFullText()}`,
            false
          );
          node = commentedStatement;
        } else {
          return ts.factory.createNotEmittedStatement(node);
        }
      }

      if (ts.isTypeAliasDeclaration(node) && node.modifiers) {
        const modifiers = node.modifiers.filter(mod => mod.kind !== ts.SyntaxKind.ExportKeyword);
        node = ts.factory.updateTypeAliasDeclaration(
          node,
          modifiers,
          node.name,
          node.typeParameters,
          node.type
        );
      }

      if (ts.isVariableStatement(node) && node.modifiers) {
        const modifiers = node.modifiers.filter(mod => mod.kind !== ts.SyntaxKind.ExportKeyword);
        node = ts.factory.updateVariableStatement(
          node,
          modifiers,
          node.declarationList
        );
      }

      return ts.visitEachChild(node, visit, context);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}