import * as vscode from "vscode";
import { spawn } from "child_process";
import * as path from "path";
import { appendLine, showErrorMessage, showInfoMessage } from "./output";

function getRustfmtPath(): string {
  const config = vscode.workspace.getConfiguration("rusty");
  return config.get<string>("rustfmtPath", "rustfmt");
}

function getRustfmtArgs(): string[] {
  const config = vscode.workspace.getConfiguration("rusty");
  return config.get<string[]>("rustfmtArgs", []);
}

export async function formatWithRustfmt(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const rustfmtPath = getRustfmtPath();
    const rustfmtArgs = getRustfmtArgs();
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(vscode.workspace.rootPath || "", filePath);

    appendLine(
      `Executing command: ${rustfmtPath} ${[...rustfmtArgs, absolutePath].join(" ")}`
    );

    const rustfmt = spawn(rustfmtPath, [...rustfmtArgs, absolutePath]);

    let stderrData = "";
    let stdoutData = "";

    rustfmt.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    rustfmt.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    rustfmt.on("close", (code) => {
      if (code !== 0) {
        appendLine(`❌ rustfmt exited with code ${code}`);
        appendLine(`Error executing rustfmt:\n${stderrData.trim()}`);
        reject(
          new Error(
            stderrData.trim() ||
              "Unknown error occurred while running rustfmt."
          )
        );
      } else {
        if (stderrData.trim()) {
          appendLine(
            `⚠️ Rustfmt warnings/errors:\n${stderrData.trim()}`
          );
        }
        if (stdoutData.trim()) {
          appendLine(`✅ Rustfmt output:\n${stdoutData.trim()}`);
        }
        resolve();
      }
    });

    rustfmt.on("error", (err) => {
      appendLine(`❌ Failed to start rustfmt: ${err.message}`);
      reject(new Error(`Failed to start rustfmt: ${err.message}`));
    });
  });
}

export async function formatActiveFile(): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    showErrorMessage("No active editor found!");
    appendLine("No active editor found.");
    return;
  }

  const document = editor.document;

  if (document.languageId !== "rust") {
    showErrorMessage(
      "Rusty Formatter can only format Rust files."
    );
    appendLine("Attempted to format a non-Rust file.");
    return;
  }

  if (document.isDirty) {
    appendLine(
      "Unsaved changes detected. Saving the document..."
    );
    await document.save();
  } else {
    appendLine("Document is already saved.");
  }

  if (document.isUntitled) {
    showErrorMessage(
      "Please save the document before formatting."
    );
    appendLine(
      "Attempted to format an unsaved (untitled) document."
    );
    return;
  }

  try {
    showInfoMessage("⚙️ Formatting Rust code...");
    appendLine(
      `Formatting started for file: ${document.fileName}`
    );
    await formatWithRustfmt(document.fileName);
    showInfoMessage(
      "✅ Rust code formatted successfully!"
    );
    appendLine("Formatting completed successfully.");
    await document.save();
  } catch (error) {
    if (error instanceof Error) {
      showErrorMessage(`❌ Formatting failed: ${error.message}`);
      appendLine(`Formatting failed: ${error.message}`);
    } else {
      showErrorMessage("❌ Formatting failed: Unknown error.");
      appendLine("Formatting failed: Unknown error.");
    }
  }
}