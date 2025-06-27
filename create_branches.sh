#!/bin/bash

# Navigate to the project directory
cd /home/jez/claude/flow-state-dev

echo "=== Current Git Status ==="
git status

echo ""
echo "=== Current Branch ==="
git branch --show-current

echo ""
echo "=== Creating feature branches ==="

# Create the feature branches from main
echo "Creating feature/gui-polish-error-handling..."
git checkout -b feature/gui-polish-error-handling main

echo "Creating feature/gui-polish-performance..."
git checkout -b feature/gui-polish-performance main

echo "Creating feature/gui-polish-real-api..."
git checkout -b feature/gui-polish-real-api main

echo ""
echo "=== Switching back to main ==="
git checkout main

echo ""
echo "=== List all branches ==="
git branch -a

echo ""
echo "=== Pushing branches to remote ==="
git push -u origin feature/gui-polish-error-handling
git push -u origin feature/gui-polish-performance
git push -u origin feature/gui-polish-real-api

echo ""
echo "=== Final status ==="
git status