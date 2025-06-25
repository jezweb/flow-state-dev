# Linux Troubleshooting Guide

This guide helps resolve common issues with npm global packages on Linux Mint, Ubuntu, and other Debian-based distributions.

## Common Issue: EACCES Permission Denied

If you get an error like this when installing Flow State Dev (or Claude Code):

```
npm error code EACCES
npm error syscall mkdir
npm error path /usr/lib/node_modules/@anthropic-ai
npm error errno -13
npm error Error: EACCES: permission denied, mkdir '/usr/lib/node_modules/@anthropic-ai'
```

### Quick Fix (NOT Recommended)

```bash
sudo npm install -g flow-state-dev
# or
sudo npm install -g @anthropic-ai/claude-code
```

⚠️ **Warning**: Using `sudo` with npm is discouraged because:
- It can create permission issues for future npm operations
- It runs install scripts with root privileges (security risk)
- It can break npm's ability to manage packages properly

### Better Solutions

#### Option 1: Use npx (Recommended - No Installation Needed!)
```bash
# Run without installing
npx flow-state-dev init my-app
```

#### Option 2: Change npm's Default Directory
```bash
# Create a directory for global packages
mkdir ~/.npm-global

# Configure npm to use this directory
npm config set prefix '~/.npm-global'

# Add to your PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Now install without sudo
npm install -g flow-state-dev
```

#### Option 3: Fix npm Permissions
```bash
# Change ownership of npm's directories
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Now install without sudo
npm install -g flow-state-dev
```

## Quick Solution: Use npx

The easiest way to avoid all installation issues is to use npx:

```bash
# No installation needed!
npx flow-state-dev init my-app
```

## Common Issue: "command not found" After Global Install

If you've installed Flow State Dev globally but get "command not found" when running `fsd`, this is usually a PATH configuration issue.

## Quick Diagnosis

Run these commands to diagnose the issue:

```bash
# 1. Check where npm installs global packages
npm prefix -g

# 2. Check if the bin directory is in your PATH
echo $PATH

# 3. Try running the command directly
$(npm prefix -g)/bin/fsd --version

# 4. Check your Node.js installation
which node
node --version
npm --version
```

## Common Solutions

### Solution 1: Add npm global bin to PATH

For **Bash** users (default in Ubuntu/Mint):
```bash
# Add to ~/.bashrc
echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

For **Zsh** users:
```bash
# Add to ~/.zshrc
echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Solution 2: Configure npm prefix

If npm is installing to an unusual location:
```bash
# Set npm prefix to user directory
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Solution 3: Fix Node.js Installation

If you installed Node.js via apt, it might have PATH issues. Use NodeSource instead:

```bash
# Remove existing Node.js
sudo apt remove nodejs npm

# Install from NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Solution 4: Use Node Version Manager (nvm)

For the most flexible Node.js setup:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install latest LTS Node
nvm install --lts
nvm use --lts

# Now install Flow State Dev
npm install -g flow-state-dev
```

## Troubleshooting Multiple Node Installations

If you have Node installed via multiple methods (apt, snap, nvm), conflicts can occur:

```bash
# Find all Node installations
whereis node
whereis npm

# Check which is active
which node
which npm

# Remove snap version if causing issues
sudo snap remove node
```

## Permission Issues

If you get permission errors during global install:

```bash
# Option 1: Change npm's default directory (recommended)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Option 2: Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

## Verify Installation

After fixing PATH issues:

```bash
# Test the command
fsd --version

# If still not found, check PATH
echo $PATH | grep npm

# Run our diagnostic tool
curl -sSL https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.sh | bash
```

## Still Having Issues?

1. **Restart your terminal** - PATH changes require a new terminal session
2. **Log out and back in** - Some PATH changes require a fresh login
3. **Check shell configuration** - Make sure you edited the right file (.bashrc vs .zshrc)
4. **Report an issue** - If none of these work, please report at https://github.com/jezweb/flow-state-dev/issues

## Additional Resources

- [npm docs: Fixing npm permissions](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)
- [Node.js installation guides](https://nodejs.org/en/download/package-manager/)
- [nvm documentation](https://github.com/nvm-sh/nvm)