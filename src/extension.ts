import * as vscode from "vscode";
import { formatActiveFile } from "./formatter";

export function activate(context: vscode.ExtensionContext) {
  const formatCommand = vscode.commands.registerCommand(
    "rusty.format",
    async () => {
      await formatActiveFile();
    },
  );

  context.subscriptions.push(formatCommand);

}

export function deactivate(): void {}
