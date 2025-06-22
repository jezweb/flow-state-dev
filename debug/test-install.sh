#!/bin/bash

# Flow State Dev Installation Test Script
# Tests the complete installation process with verbose output

echo "🧪 Flow State Dev Installation Test"
echo "=================================="
echo

# Check prerequisites
echo "📋 Prerequisites Check:"
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo

# Show current state
echo "🔍 Current State:"
if npm list -g flow-state-dev >/dev/null 2>&1; then
    echo "📦 Flow State Dev currently installed:"
    npm list -g flow-state-dev
else
    echo "📦 Flow State Dev not currently installed"
fi

if command -v fsd >/dev/null 2>&1; then
    echo "⚡ fsd command available: $(which fsd)"
else
    echo "⚡ fsd command not available"
fi
echo

# Clean uninstall first
echo "🧹 Clean Uninstall:"
echo "Removing any existing installation..."
npm uninstall -g flow-state-dev --verbose 2>&1 | head -20
echo

# Clear npm cache
echo "🗑️  Clearing npm cache:"
npm cache clean --force
echo "✅ Cache cleared"
echo

# Fresh install with verbose output
echo "📥 Fresh Installation (with verbose output):"
echo "Installing flow-state-dev@latest..."
echo
npm install -g flow-state-dev@latest --verbose --timing 2>&1 | tee /tmp/fsd-install.log
INSTALL_EXIT_CODE=$?
echo
echo "Installation exit code: $INSTALL_EXIT_CODE"

if [ $INSTALL_EXIT_CODE -ne 0 ]; then
    echo "❌ Installation failed!"
    echo "Check the log above for errors."
    exit 1
fi

# Verify installation
echo
echo "✅ Installation completed. Verifying..."
echo

# Check if package is listed
echo "📦 Package verification:"
if npm list -g flow-state-dev >/dev/null 2>&1; then
    echo "✅ Package found in global list:"
    npm list -g flow-state-dev
else
    echo "❌ Package not found in global list"
fi
echo

# Check bin file
echo "📁 Bin file verification:"
NPM_BIN=$(npm bin -g)
BIN_FILE="$NPM_BIN/fsd"

echo "npm bin directory: $NPM_BIN"
echo "Expected bin file: $BIN_FILE"

if [ -f "$BIN_FILE" ]; then
    echo "✅ Bin file exists"
    echo "File info: $(ls -la "$BIN_FILE")"
    
    if [ -x "$BIN_FILE" ]; then
        echo "✅ Bin file is executable"
    else
        echo "❌ Bin file is NOT executable"
        echo "Attempting to fix permissions..."
        chmod +x "$BIN_FILE"
        if [ -x "$BIN_FILE" ]; then
            echo "✅ Permissions fixed"
        else
            echo "❌ Could not fix permissions"
        fi
    fi
else
    echo "❌ Bin file does NOT exist"
    echo "This indicates a packaging or installation problem"
fi
echo

# Test command availability
echo "⚡ Command availability test:"
if command -v fsd >/dev/null 2>&1; then
    echo "✅ fsd command found: $(which fsd)"
    
    # Test version command
    echo "Testing version command..."
    if fsd --version >/dev/null 2>&1; then
        echo "✅ Version command works: $(fsd --version)"
    else
        echo "❌ Version command failed"
    fi
    
    # Test help command
    echo "Testing help command..."
    if fsd --help >/dev/null 2>&1; then
        echo "✅ Help command works"
    else
        echo "❌ Help command failed"
    fi
    
else
    echo "❌ fsd command NOT found"
    
    # Check PATH
    echo "Checking PATH..."
    if echo "$PATH" | grep -q "$NPM_BIN"; then
        echo "✅ npm bin directory is in PATH"
        echo "This suggests a different issue"
    else
        echo "❌ npm bin directory is NOT in PATH"
        echo "Current PATH: $PATH"
        echo
        echo "💡 Try adding to your shell profile:"
        echo "   export PATH=\"$NPM_BIN:\$PATH\""
    fi
fi
echo

# Direct execution test
echo "🎯 Direct execution test:"
if [ -f "$BIN_FILE" ]; then
    echo "Testing direct execution of bin file..."
    if "$BIN_FILE" --version >/dev/null 2>&1; then
        echo "✅ Direct execution works: $("$BIN_FILE" --version)"
    else
        echo "❌ Direct execution failed"
        echo "Attempting with node explicitly..."
        if node "$BIN_FILE" --version >/dev/null 2>&1; then
            echo "✅ Execution with node works: $(node "$BIN_FILE" --version)"
        else
            echo "❌ Even explicit node execution failed"
            echo "This suggests a problem with the bin file itself"
        fi
    fi
else
    echo "❌ Cannot test - bin file does not exist"
fi
echo

# Summary
echo "📊 Test Summary:"
echo "================"

if command -v fsd >/dev/null 2>&1 && fsd --version >/dev/null 2>&1; then
    echo "🎉 SUCCESS! Flow State Dev is working correctly."
    echo "   Version: $(fsd --version)"
    echo "   Location: $(which fsd)"
else
    echo "❌ FAILURE! Flow State Dev is not working correctly."
    echo
    echo "Possible issues:"
    if [ ! -f "$BIN_FILE" ]; then
        echo "  • Bin file was not created during installation"
    elif [ ! -x "$BIN_FILE" ]; then
        echo "  • Bin file is not executable"
    elif ! echo "$PATH" | grep -q "$NPM_BIN"; then
        echo "  • npm bin directory is not in PATH"
    else
        echo "  • Unknown issue - may be a runtime error in the script"
    fi
    
    echo
    echo "📝 Next steps:"
    echo "  1. Share the installation log (/tmp/fsd-install.log) if it exists"
    echo "  2. Run the diagnostic script: curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.sh | bash"
    echo "  3. Create an issue at: https://github.com/jezweb/flow-state-dev/issues"
fi

echo
echo "📄 Installation log saved to: /tmp/fsd-install.log"
echo "💡 For more help, visit: https://github.com/jezweb/flow-state-dev/issues"