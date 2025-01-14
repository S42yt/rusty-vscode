import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

const outputChannel = vscode.window.createOutputChannel('Rusty Formatter');

function getRustfmtPath(): string {
    const config = vscode.workspace.getConfiguration('rusty');
    return config.get<string>('rustfmtPath', 'rustfmt');
}

export async function formatWithRustfmt(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const rustfmtPath = getRustfmtPath();

        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(vscode.workspace.rootPath || '', filePath);

        outputChannel.appendLine(`Executing command: ${rustfmtPath} ${absolutePath}`);

        const rustfmt = spawn(rustfmtPath, [absolutePath]);

        let stderrData = '';
        let stdoutData = '';

        rustfmt.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        rustfmt.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        rustfmt.on('close', (code) => {
            if (code !== 0) {
                outputChannel.appendLine(`rustfmt exited with code ${code}`);
                outputChannel.appendLine(`Error executing rustfmt:\n${stderrData.trim()}`);
                reject(new Error(stderrData.trim() || 'Unknown error'));
            } else {
                if (stderrData.trim()) {
                    outputChannel.appendLine(`Rustfmt warnings/errors:\n${stderrData.trim()}`);
                }
                if (stdoutData.trim()) {
                    outputChannel.appendLine(`Rustfmt output:\n${stdoutData.trim()}`);
                }
                resolve();
            }
        });

        rustfmt.on('error', (err) => {
            outputChannel.appendLine(`Failed to start rustfmt: ${err.message}`);
            reject(new Error(`Failed to start rustfmt: ${err.message}`));
        });
    });
}

export async function formatActiveFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found!');
        outputChannel.appendLine('No active editor found.');
        return;
    }

    const document = editor.document;

    if (document.languageId !== 'rust') {
        vscode.window.showErrorMessage('Rusty can only format Rust files.');
        outputChannel.appendLine('Attempted to format a non-Rust file.');
        return;
    }

    if (document.isDirty) {
        outputChannel.appendLine('Document has unsaved changes. Saving now...');
        await document.save();
    } else {
        outputChannel.appendLine('Document is already saved.');
    }

    if (document.isUntitled) {
        vscode.window.showErrorMessage('Please save the document before formatting.');
        outputChannel.appendLine('Attempted to format an unsaved (untitled) document.');
        return;
    }

    try {
        vscode.window.showInformationMessage('Formatting Rust code...');
        outputChannel.appendLine(`Formatting started for file: ${document.fileName}`);
        await formatWithRustfmt(document.fileName);
        vscode.window.showInformationMessage('✅ Rust code formatted successfully!');
        outputChannel.appendLine('Formatting completed successfully.');
        await document.save();
    } catch (error) {
        vscode.window.showErrorMessage(`❌ Formatting failed: ${error}`);
        outputChannel.appendLine(`Formatting failed: ${error}`);
    }
}
