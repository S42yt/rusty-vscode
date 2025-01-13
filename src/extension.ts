import * as vscode from 'vscode';
import { formatRustCode } from './formatter';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('rusty.format', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'rust') {
      const formatted = formatRustCode(editor.document.getText());
      editor.edit(editBuilder => {
        const fullRange = new vscode.Range(
          editor.document.positionAt(0),
          editor.document.positionAt(editor.document.getText().length)
        );
        editBuilder.replace(fullRange, formatted);
      });
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}