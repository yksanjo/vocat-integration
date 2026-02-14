# VoCAT-Integration

VoCAT integration for VS Code, Cursor, and other editors. MCP server implementation.

## Features

- VS Code extension
- Cursor IDE integration
- MCP (Model Context Protocol) server
- Voice commands in editor
- Inline terminal output
- Git integration in sidebar

## Installation

### VS Code
1. Search "VoCAT" in Extensions marketplace
2. Install and reload

### Cursor IDE
1. Search "VoCAT" in Extensions
2. Install and restart

### MCP Server
```bash
npm install -g vocat-mcp
vocat-mcp-server
```

## Usage

Voice commands available:
- "run tests" - Run test suite
- "commit changes" - Commit current changes
- "push" - Push to remote
- "build project" - Run build
- "open file [name]" - Open file
- "go to line [number]" - Navigate to line

## Configuration

Add to settings.json:
```json
{
  "vocat.voiceEnabled": true,
  "vocat.activationPhrase": "hey vo cat",
  "vocat.theme": "jarvis"
}
```

## MCP Protocol

Connect to VoCAT MCP server:
```json
{
  "mcpServers": {
    "vocat": {
      "command": "npx",
      "args": ["vocat-mcp"]
    }
  }
}
```

## License

MIT
