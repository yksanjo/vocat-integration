#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

class MCPServer {
  constructor() {
    this.name = 'vocat';
    this.version = '1.0.0';
    this.tools = this.getTools();
    this.resources = this.getResources();
  }

  getTools() {
    return [
      {
        name: 'execute_command',
        description: 'Execute a terminal command',
        inputSchema: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'Command to execute' }
          },
          required: ['command']
        }
      },
      {
        name: 'git_status',
        description: 'Get git repository status',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'git_commit',
        description: 'Commit changes',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Commit message' }
          },
          required: ['message']
        }
      },
      {
        name: 'git_push',
        description: 'Push to remote',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'git_pull',
        description: 'Pull from remote',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'speak',
        description: 'Text to speech',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to speak' }
          },
          required: ['text']
        }
      },
      {
        name: 'run_tests',
        description: 'Run test suite',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'build_project',
        description: 'Build the project',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
  }

  getResources() {
    return [
      {
        uri: 'vocat://status',
        name: 'VoCAT Status',
        description: 'Current VoCAT service status'
      },
      {
        uri: 'vocat://config',
        name: 'VoCAT Config',
        description: 'Current configuration'
      }
    ];
  }

  async executeCommand(cmd) {
    return new Promise((resolve) => {
      const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
      const child = spawn(shell, ['-c', cmd], { shell: false });
      
      let stdout = '', stderr = '';
      child.stdout?.on('data', d => stdout += d.toString());
      child.stderr?.on('data', d => stderr += d.toString());
      
      child.on('close', code => {
        resolve({ success: code === 0, output: stdout, error: stderr });
      });
    });
  }

  async handleTool(tool, args) {
    switch (tool) {
      case 'execute_command':
        return await this.executeCommand(args.command);
      
      case 'git_status':
        return await this.executeCommand('git status --porcelain');
      
      case 'git_commit':
        await this.executeCommand('git add -A');
        return await this.executeCommand(`git commit -m "${args.message}"`);
      
      case 'git_push':
        return await this.executeCommand('git push');
      
      case 'git_pull':
        return await this.executeCommand('git pull');
      
      case 'speak':
        return await this.executeCommand(`say "${args.text}"`);
      
      case 'run_tests':
        return await this.executeCommand('npm test');
      
      case 'build_project':
        return await this.executeCommand('npm run build');
      
      default:
        return { error: 'Unknown tool' };
    }
  }

  start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.on('line', async (line) => {
      try {
        const msg = JSON.parse(line);
        
        if (msg.method === 'initialize') {
          console.log(JSON.stringify({
            jsonrpc: '2.0',
            id: msg.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
                resources: {}
              },
              serverInfo: { name: this.name, version: this.version }
            }
          }));
        }
        
        if (msg.method === 'tools/list') {
          console.log(JSON.stringify({
            jsonrpc: '2.0',
            id: msg.id,
            result: { tools: this.tools }
          }));
        }
        
        if (msg.method === 'tools/call') {
          const result = await this.handleTool(msg.params.name, msg.params.arguments || {});
          console.log(JSON.stringify({
            jsonrpc: '2.0',
            id: msg.id,
            result: { content: [{ type: 'text', text: JSON.stringify(result) }] }
          }));
        }
        
        if (msg.method === 'resources/list') {
          console.log(JSON.stringify({
            jsonrpc: '2.0',
            id: msg.id,
            result: { resources: this.resources }
          }));
        }
        
      } catch (e) {
        console.error('Error:', e.message);
      }
    });
  }
}

const server = new MCPServer();
server.start();
