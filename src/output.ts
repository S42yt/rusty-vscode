import * as vscode from "vscode";

const outputChannel = vscode.window.createOutputChannel("Rusty Formatter");

export function appendLine(message: string): void {
  outputChannel.appendLine(message);
}

export function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(message);
}

export function showInfoMessage(message: string): void {
  vscode.window.showInformationMessage(message);
}

export function deactivateOutputChannel(): void {
  outputChannel.dispose();
}