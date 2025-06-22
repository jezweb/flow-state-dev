# Flow State Dev Diagnostic Tools

This directory contains diagnostic and debugging tools to help troubleshoot Flow State Dev installation issues.

## 🔧 Available Tools

### 1. Quick Diagnostic (`diagnose.sh`)

**Purpose**: Comprehensive system and installation analysis  
**Usage**: 
```bash
# Run directly from GitHub
curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.sh | bash

# Or download and run
wget https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.sh
chmod +x diagnose.sh
./diagnose.sh
```

**What it checks**:
- System information (OS, architecture, Node.js version)
- npm configuration and PATH
- Flow State Dev installation status
- File permissions and executable status
- Common configuration issues

### 2. Node.js Diagnostic (`diagnose.js`)

**Purpose**: Detailed analysis using Node.js APIs  
**Usage**:
```bash
# Run directly from GitHub
node -e "$(curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.js)"

# Or download and run
wget https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.js
node diagnose.js
```

**What it checks**:
- Deep package analysis
- Dependency verification
- Module resolution testing
- Binary file analysis

### 3. Installation Tester (`test-install.sh`)

**Purpose**: Test the complete installation process with verbose output  
**Usage**:
```bash
# Run directly from GitHub
curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/test-install.sh | bash

# Or download and run
wget https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/test-install.sh
chmod +x test-install.sh
./test-install.sh
```

**What it does**:
- Clean uninstall of existing installation
- Fresh installation with verbose output
- Step-by-step verification
- Comprehensive testing

### 4. Installation Fixer (`fix-install.sh`)

**Purpose**: Automatically fix common installation issues  
**Usage**:
```bash
# Run directly from GitHub
curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/fix-install.sh | bash

# Or download and run
wget https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/fix-install.sh
chmod +x fix-install.sh
./fix-install.sh
```

**What it fixes**:
- Cleans npm cache and reinstalls
- Fixes file permissions
- Updates PATH configuration
- Tests and verifies fixes

## 🎯 When to Use Which Tool

### 🔍 **Start with `diagnose.sh`**
- First step for any installation issue
- Quick overview of system state
- Identifies most common problems
- Provides specific fix recommendations

### 🧪 **Use `test-install.sh` for persistent issues**
- When diagnosis shows problems but cause is unclear
- To test installation process step-by-step
- Generates detailed logs for troubleshooting

### 🔧 **Try `fix-install.sh` for automated repairs**
- When you want to attempt automatic fixes
- After diagnosis identifies specific issues
- For common PATH and permission problems

### 💻 **Use `diagnose.js` for deep analysis**
- When shell scripts don't provide enough detail
- For package and dependency analysis
- When you need Node.js-specific information

## 📋 Common Issues & Solutions

### Issue: "Command 'fsd' not found"

**Likely causes**:
1. npm bin directory not in PATH
2. Binary file not created during installation
3. Binary file not executable
4. npm configuration issues

**Diagnosis**: Run `diagnose.sh`  
**Fix**: Run `fix-install.sh`

### Issue: "Package installed but command doesn't work"

**Likely causes**:
1. PATH configuration issue
2. Permission problems
3. Corrupted installation

**Diagnosis**: Run `diagnose.js` for detailed analysis  
**Fix**: Run `test-install.sh` to reinstall cleanly

### Issue: "Permission denied" during installation

**Likely causes**:
1. Need sudo for global npm installs
2. npm prefix misconfigured
3. File system permissions

**Diagnosis**: Check npm configuration  
**Fix**: Configure npm to use user directory or use sudo

## 🆘 Getting Help

If none of the diagnostic tools solve your issue:

1. **Run the diagnostic** first:
   ```bash
   curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.sh | bash
   ```

2. **Create a GitHub issue** with:
   - The complete output from the diagnostic
   - Your operating system and Node.js version
   - Steps you've already tried

3. **Include relevant logs**:
   - Installation logs from `test-install.sh`
   - Any error messages
   - Output from manual installation attempts

## 🔗 Links

- **GitHub Issues**: https://github.com/jezweb/flow-state-dev/issues
- **Main Documentation**: https://github.com/jezweb/flow-state-dev
- **npm Package**: https://www.npmjs.com/package/flow-state-dev

## 💡 Tips

- **Always restart your terminal** after PATH changes
- **Use verbose npm output** for debugging: `npm install -g flow-state-dev --verbose`
- **Check multiple shells** if you use different terminals
- **Clear npm cache** if having persistent issues: `npm cache clean --force`