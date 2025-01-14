import * as vscode from 'vscode';
import { formatActiveFile } from './formatter';

export function activate(context: vscode.ExtensionContext) {
    const formatCommand = vscode.commands.registerCommand('rusty.format', async () => {
        await formatActiveFile();
    });

    context.subscriptions.push(formatCommand);

    const saveListener = vscode.workspace.onWillSaveTextDocument(async (event) => {
        const document = event.document;

        if (document.languageId === 'rust') {
            try {
                await formatActiveFile();
            } catch (error) {
                vscode.window.showErrorMessage(`❌ Formatting on save failed: ${error}`);
            }
        }
    });

    context.subscriptions.push(saveListener);

    // Initial log to indicate activation
    const outputChannel = vscode.window.createOutputChannel('Rusty Formatter');
    outputChannel.appendLine('Rusty extension activated.');
    outputChannel.show(true); // Show the Output Channel on activation
}
