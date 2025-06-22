#!/bin/bash

# Flow State Dev Installation Diagnostic Tool
# Usage: curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.sh | bash

echo "🔍 Flow State Dev Installation Diagnostics"
echo "========================================"
echo

# Basic system info
echo "📋 System Information:"
echo "OS: $(uname -s) $(uname -r)"
echo "Architecture: $(uname -m)"
echo "Shell: $SHELL"
echo "User: $(whoami)"
echo

# Node.js and npm versions
echo "📦 Node.js Environment:"
if command -v node >/dev/null 2>&1; then
    echo "Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
fi

if command -v npm >/dev/null 2>&1; then
    echo "npm: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi
echo

# Check for Node version managers
echo "🔧 Node Version Managers:"
if [ -f "$HOME/.nvmrc" ] || [ -d "$HOME/.nvm" ]; then
    echo "nvm detected"
    if command -v nvm >/dev/null 2>&1; then
        echo "nvm version: $(nvm --version 2>/dev/null || echo 'nvm command not available')"
    fi
fi

if command -v n >/dev/null 2>&1; then
    echo "n detected: $(n --version)"
fi

if command -v fnm >/dev/null 2>&1; then
    echo "fnm detected: $(fnm --version)"
fi
echo

# npm configuration
echo "⚙️  npm Configuration:"
echo "Prefix: $(npm config get prefix)"
NPM_BIN=$(npm bin -g 2>/dev/null || npm prefix -g 2>/dev/null | xargs -I {} echo {}/bin)
echo "Global bin directory: $NPM_BIN"
echo "Cache directory: $(npm config get cache)"
echo "Registry: $(npm config get registry)"
echo

# Check PATH
echo "🛤️  PATH Analysis:"
echo "npm bin directory: $NPM_BIN"

if echo "$PATH" | grep -q "$NPM_BIN"; then
    echo "✅ npm bin directory IS in PATH"
else
    echo "❌ npm bin directory is NOT in PATH"
    echo "Current PATH directories:"
    echo "$PATH" | tr ':' '\n' | sed 's/^/  /'
fi
echo

# Check Flow State Dev installation
echo "📱 Flow State Dev Status:"
FSD_INSTALLED=$(npm list -g flow-state-dev 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Package installed globally:"
    echo "$FSD_INSTALLED" | grep flow-state-dev
else
    echo "❌ Package NOT installed globally"
fi

# Check for fsd command
if command -v fsd >/dev/null 2>&1; then
    echo "✅ fsd command found: $(which fsd)"
    echo "Version: $(fsd --version 2>/dev/null || echo 'Version check failed')"
else
    echo "❌ fsd command NOT found"
fi

# Check bin file directly
BIN_FILE="$NPM_BIN/fsd"
if [ -f "$BIN_FILE" ]; then
    echo "✅ Bin file exists: $BIN_FILE"
    echo "Permissions: $(ls -la "$BIN_FILE")"
    
    # Test bin file directly
    if [ -x "$BIN_FILE" ]; then
        echo "✅ Bin file is executable"
        echo "Direct test: $("$BIN_FILE" --version 2>/dev/null || echo 'Direct execution failed')"
    else
        echo "❌ Bin file is NOT executable"
    fi
else
    echo "❌ Bin file does NOT exist: $BIN_FILE"
fi
echo

# Check for conflicts
echo "🔍 Potential Conflicts:"
# Check for multiple Node installations
NODE_LOCATIONS=$(which -a node 2>/dev/null | wc -l)
if [ "$NODE_LOCATIONS" -gt 1 ]; then
    echo "⚠️  Multiple Node.js installations found:"
    which -a node | sed 's/^/  /'
fi

# Check for permission issues
if [ ! -w "$(npm config get prefix)" ]; then
    echo "⚠️  No write permission to npm prefix directory"
fi

# Check shell configuration
echo
echo "🐚 Shell Configuration:"
SHELL_RC=""
case "$SHELL" in
    */bash) SHELL_RC="$HOME/.bashrc" ;;
    */zsh) SHELL_RC="$HOME/.zshrc" ;;
    */fish) SHELL_RC="$HOME/.config/fish/config.fish" ;;
esac

if [ -n "$SHELL_RC" ] && [ -f "$SHELL_RC" ]; then
    echo "Shell config file: $SHELL_RC"
    if grep -q "$NPM_BIN" "$SHELL_RC" 2>/dev/null; then
        echo "✅ npm bin directory found in shell config"
    else
        echo "❌ npm bin directory NOT found in shell config"
    fi
else
    echo "Shell config file not found or unsupported shell"
fi

echo
echo "🎯 Summary & Recommendations:"
echo "=============================="

# Provide specific recommendations
if ! command -v fsd >/dev/null 2>&1; then
    if [ ! -f "$BIN_FILE" ]; then
        echo "❌ ISSUE: Bin file missing - package may not be properly installed"
        echo "💡 FIX: Try reinstalling with verbose output:"
        echo "   npm uninstall -g flow-state-dev"
        echo "   npm install -g flow-state-dev --verbose"
    elif [ ! -x "$BIN_FILE" ]; then
        echo "❌ ISSUE: Bin file not executable"
        echo "💡 FIX: Make bin file executable:"
        echo "   chmod +x '$BIN_FILE'"
    elif ! echo "$PATH" | grep -q "$NPM_BIN"; then
        echo "❌ ISSUE: npm bin directory not in PATH"
        echo "💡 FIX: Add to your shell configuration:"
        echo "   echo 'export PATH=\"$NPM_BIN:\$PATH\"' >> $SHELL_RC"
        echo "   source $SHELL_RC"
    else
        echo "❌ ISSUE: Unknown - bin file exists and is executable, PATH is correct"
        echo "💡 FIX: Try clearing npm cache and reinstalling:"
        echo "   npm cache clean --force"
        echo "   npm uninstall -g flow-state-dev"
        echo "   npm install -g flow-state-dev"
    fi
else
    echo "✅ Flow State Dev appears to be working correctly!"
fi

echo
echo "📝 Need help? Share this output at:"
echo "   https://github.com/jezweb/flow-state-dev/issues"