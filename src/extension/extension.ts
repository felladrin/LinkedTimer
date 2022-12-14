import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate({ subscriptions, extensionPath }: vscode.ExtensionContext) {
  const startTimerCommand = vscode.commands.registerCommand("linked-timer.new-timer", () => {
    const panel = vscode.window.createWebviewPanel("linked-timer", "Linked Timer", vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
    });

    const { webview } = panel;

    webview.html = fs.readFileSync(vscode.Uri.file(path.resolve(extensionPath, "dist/index.html")).fsPath, "utf8");

    webview.onDidReceiveMessage((event) => {
      if ("panelTitle" in event) {
        panel.title = event.panelTitle;
      }

      if ("informationMessage" in event) {
        vscode.window.showInformationMessage(event.informationMessage);
      }
    });

    webview.postMessage({ message: "Hello from extension.ts!" });
  });

  subscriptions.push(startTimerCommand);
}
