#!/bin/bash

# Flow State Dev Installation Fix Script
# Attempts to automatically fix common installation issues

echo "🔧 Flow State Dev Installation Fix"
echo "================================="
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to add directory to PATH in shell config
add_to_path() {
    local dir="$1"
    local shell_config=""
    
    case "$SHELL" in
        */bash) shell_config="$HOME/.bashrc" ;;
        */zsh) shell_config="$HOME/.zshrc" ;;
        */fish) shell_config="$HOME/.config/fish/config.fish" ;;
        *) 
            echo "⚠️  Unsupported shell: $SHELL"
            echo "Please manually add $dir to your PATH"
            return 1
            ;;
    esac
    
    if [ -f "$shell_config" ]; then
        if ! grep -q "$dir" "$shell_config" 2>/dev/null; then
            echo "Adding $dir to PATH in $shell_config"
            echo "" >> "$shell_config"
            echo "# Added by Flow State Dev fix script" >> "$shell_config"
            echo "export PATH=\"$dir:\$PATH\"" >> "$shell_config"
            echo "✅ PATH updated in $shell_config"
            echo "💡 Restart your terminal or run: source $shell_config"
            return 0
        else
            echo "✅ PATH already contains $dir in $shell_config"
            return 0
        fi
    else
        echo "❌ Shell config file not found: $shell_config"
        return 1
    fi
}

# Check prerequisites
echo "📋 Checking Prerequisites:"
if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo

# Get npm configuration
NPM_PREFIX=$(npm config get prefix)
NPM_BIN=$(npm bin -g)

echo "📂 npm Configuration:"
echo "Prefix: $NPM_PREFIX"
echo "Global bin: $NPM_BIN"
echo

# Check for permission issues
echo "🔐 Permission Check:"
if [ -w "$NPM_PREFIX" ]; then
    echo "✅ Write permission to npm prefix directory"
else
    echo "❌ No write permission to npm prefix directory"
    echo "💡 This may require sudo or reconfiguring npm"
    echo "   Consider running: npm config set prefix ~/.npm-global"
    echo "   Then add ~/.npm-global/bin to your PATH"
fi
echo

# Fix 1: Clean uninstall and cache clear
echo "🧹 Fix 1: Clean Uninstall and Cache Clear"
echo "Removing any existing installation..."

if npm list -g flow-state-dev >/dev/null 2>&1; then
    echo "Uninstalling existing flow-state-dev..."
    npm uninstall -g flow-state-dev
else
    echo "No existing installation found"
fi

echo "Clearing npm cache..."
npm cache clean --force
echo "✅ Cleanup completed"
echo

# Fix 2: Fresh installation
echo "📥 Fix 2: Fresh Installation"
echo "Installing flow-state-dev with verbose output..."

if npm install -g flow-state-dev@latest --verbose; then
    echo "✅ Installation completed"
else
    echo "❌ Installation failed"
    echo "💡 Try installing with sudo (not recommended) or reconfigure npm"
    echo "   Or install locally: npm install flow-state-dev"
    exit 1
fi
echo

# Fix 3: Check and fix bin file permissions
echo "🔧 Fix 3: Bin File Permissions"
BIN_FILE="$NPM_BIN/fsd"

if [ -f "$BIN_FILE" ]; then
    echo "✅ Bin file exists: $BIN_FILE"
    
    if [ -x "$BIN_FILE" ]; then
        echo "✅ Bin file is executable"
    else
        echo "❌ Bin file is not executable, fixing..."
        chmod +x "$BIN_FILE"
        if [ -x "$BIN_FILE" ]; then
            echo "✅ Permissions fixed"
        else
            echo "❌ Could not fix permissions"
        fi
    fi
else
    echo "❌ Bin file does not exist"
    echo "This indicates a packaging problem"
    exit 1
fi
echo

# Fix 4: PATH configuration
echo "🛤️  Fix 4: PATH Configuration"
if echo "$PATH" | grep -q "$NPM_BIN"; then
    echo "✅ npm bin directory is already in PATH"
else
    echo "❌ npm bin directory is not in PATH"
    echo "Attempting to fix PATH configuration..."
    
    if add_to_path "$NPM_BIN"; then
        echo "✅ PATH configuration updated"
        # Update PATH for current session
        export PATH="$NPM_BIN:$PATH"
        echo "✅ PATH updated for current session"
    else
        echo "❌ Could not automatically update PATH"
        echo "💡 Manually add this to your shell profile:"
        echo "   export PATH=\"$NPM_BIN:\$PATH\""
    fi
fi
echo

# Fix 5: Test the fixes
echo "🧪 Fix 5: Testing Installation"

# Refresh command hash (for bash)
if command_exists hash; then
    hash -r 2>/dev/null
fi

if command_exists fsd; then
    echo "✅ fsd command found: $(which fsd)"
    
    if fsd --version >/dev/null 2>&1; then
        INSTALLED_VERSION=$(fsd --version)
        echo "✅ fsd working correctly: v$INSTALLED_VERSION"
        
        # Test basic functionality
        if fsd --help >/dev/null 2>&1; then
            echo "✅ Help command works"
        else
            echo "⚠️  Help command failed, but version works"
        fi
        
    else
        echo "❌ fsd command found but not working"
        echo "Trying direct execution..."
        if "$BIN_FILE" --version >/dev/null 2>&1; then
            echo "✅ Direct execution works, PATH issue resolved"
        else
            echo "❌ Direct execution also fails"
        fi
    fi
else
    echo "❌ fsd command still not found"
    echo "💡 Try:"
    echo "   1. Restart your terminal"
    echo "   2. Run: source ~/.bashrc (or ~/.zshrc)"
    echo "   3. Run: export PATH=\"$NPM_BIN:\$PATH\""
fi
echo

# Final status
echo "🎯 Fix Summary:"
echo "==============="

if command_exists fsd && fsd --version >/dev/null 2>&1; then
    echo "🎉 SUCCESS! Flow State Dev is now working."
    echo "   Version: $(fsd --version)"
    echo "   Location: $(which fsd)"
    echo
    echo "🚀 You can now use Flow State Dev:"
    echo "   fsd init my-project"
    echo "   fsd --help"
else
    echo "❌ Flow State Dev is still not working correctly."
    echo
    echo "🔍 Manual steps to try:"
    echo "   1. Restart your terminal completely"
    echo "   2. Run: source ~/.bashrc (or ~/.zshrc)"
    echo "   3. Test: $BIN_FILE --version"
    echo "   4. Check: echo \$PATH | grep $NPM_BIN"
    echo
    echo "📞 If still not working:"
    echo "   1. Run diagnostic: curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.sh | bash"
    echo "   2. Create issue: https://github.com/jezweb/flow-state-dev/issues"
    echo "   3. Include the output from the diagnostic script"
fi

echo
echo "💡 Need more help? Visit: https://github.com/jezweb/flow-state-dev"