import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Agent Language extension is now active!');

    // Register execute command
    let executeCommand = vscode.commands.registerCommand('ai.execute', async () => {
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

        await executeAiAgent(document.fileName);
    });

    // Register validate command
    let validateCommand = vscode.commands.registerCommand('ai.validate', async () => {
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

        await validateAiAgent(document.fileName);
    });

    context.subscriptions.push(executeCommand);
    context.subscriptions.push(validateCommand);
}

async function executeAiAgent(filePath: string) {
    const terminal = vscode.window.createTerminal('AI Agent Executor');
    terminal.show();
    
    // Try to find act-runner in common locations
    const actCommand = await findActRunner();
    
    if (actCommand) {
        terminal.sendText(`${actCommand} "${filePath}"`);
        vscode.window.showInformationMessage('Executing AI Agent...');
    } else {
        vscode.window.showWarningMessage('ACT runner not found. Please install the AI Agent runtime.');
        terminal.sendText(`echo "ACT runner not found. Please install from: https://github.com/ai-ecosystem/cli-tools"`);
    }
}

async function validateAiAgent(filePath: string) {
    vscode.window.showInformationMessage('Validating AI Agent syntax...');
    
    // Basic validation - check if file has required sections
    const document = await vscode.workspace.openTextDocument(filePath);
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
}

async function findActRunner(): Promise<string | null> {
    const possibleCommands = [
        'act-runner',
        'act',
        'python3 -m act.cli',
        'python -m act.cli'
    ];
    
    for (const cmd of possibleCommands) {
        try {
            await new Promise((resolve, reject) => {
                exec(`which ${cmd.split(' ')[0]}`, (error) => {
                    if (error) reject(error);
                    else resolve(null);
                });
            });
            return cmd;
        } catch {
            continue;
        }
    }
    
    return null;
}

export function deactivate() {}
