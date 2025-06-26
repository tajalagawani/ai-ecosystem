"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const child_process_1 = require("child_process");
function activate(context) {
    console.log('AI Agent Language extension is now active!');
    // Register execute command
    let executeCommand = vscode.commands.registerCommand('ai.execute', () => __awaiter(this, void 0, void 0, function* () {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active .ai file found');
            return;
        }
        const document = activeEditor.document;
        if (!document.fileName.endsWith('.ai')) {
            vscode.window.showErrorMessage('Current file is not a .ai agent file');
            return;
        }
        yield executeAiAgent(document.fileName);
    }));
    // Register validate command
    let validateCommand = vscode.commands.registerCommand('ai.validate', () => __awaiter(this, void 0, void 0, function* () {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active .ai file found');
            return;
        }
        const document = activeEditor.document;
        if (!document.fileName.endsWith('.ai')) {
            vscode.window.showErrorMessage('Current file is not a .ai agent file');
            return;
        }
        yield validateAiAgent(document.fileName);
    }));
    context.subscriptions.push(executeCommand);
    context.subscriptions.push(validateCommand);
}
exports.activate = activate;
function executeAiAgent(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const terminal = vscode.window.createTerminal('AI Agent Executor');
        terminal.show();
        // Try to find act-runner in common locations
        const actCommand = yield findActRunner();
        if (actCommand) {
            terminal.sendText(`${actCommand} "${filePath}"`);
            vscode.window.showInformationMessage('Executing AI Agent...');
        }
        else {
            vscode.window.showWarningMessage('ACT runner not found. Please install the AI Agent runtime.');
            terminal.sendText(`echo "ACT runner not found. Please install from: https://github.com/ai-ecosystem/cli-tools"`);
        }
    });
}
function validateAiAgent(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.showInformationMessage('Validating AI Agent syntax...');
        // Basic validation - check if file has required sections
        const document = yield vscode.workspace.openTextDocument(filePath);
        const content = document.getText();
        const hasAgentSection = /\[agent\]/.test(content);
        const hasStartNode = /start_node\s*=/.test(content);
        const hasNodes = /\[node:/.test(content);
        if (!hasAgentSection) {
            vscode.window.showErrorMessage('Validation failed: Missing [agent] section');
            return;
        }
        if (!hasStartNode) {
            vscode.window.showErrorMessage('Validation failed: Missing start_node in [agent] section');
            return;
        }
        if (!hasNodes) {
            vscode.window.showErrorMessage('Validation failed: No [node:*] sections found');
            return;
        }
        vscode.window.showInformationMessage('✅ AI Agent validation passed!');
    });
}
function findActRunner() {
    return __awaiter(this, void 0, void 0, function* () {
        const possibleCommands = [
            'act-runner',
            'act',
            'python3 -m act.cli',
            'python -m act.cli'
        ];
        for (const cmd of possibleCommands) {
            try {
                yield new Promise((resolve, reject) => {
                    (0, child_process_1.exec)(`which ${cmd.split(' ')[0]}`, (error) => {
                        if (error)
                            reject(error);
                        else
                            resolve(null);
                    });
                });
                return cmd;
            }
            catch (_a) {
                continue;
            }
        }
        return null;
    });
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map