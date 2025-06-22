#!/bin/bash

# GitHub Labels Import Script
# This script imports standardized labels to your GitHub repository

echo "🏷️  GitHub Labels Import Script"
echo "==============================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed!"
    echo ""
    echo "To install:"
    echo "  • Ubuntu/Debian: sudo apt install gh"
    echo "  • macOS: brew install gh"
    echo "  • Or visit: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub!"
    echo ""
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)

if [ -z "$REPO" ]; then
    echo "❌ Error: Not in a GitHub repository!"
    echo ""
    echo "Make sure you're in a git repository with a GitHub remote."
    exit 1
fi

echo "📍 Repository: $REPO"
echo ""
echo "This will create the following labels:"
echo "  • Priority levels (high, medium, low)"
echo "  • Issue types (bug, enhancement, documentation)"
echo "  • Components (frontend, backend, database)"
echo "  • Human tasks (human-task, config, deploy)"
echo "  • Status (blocked, in-progress, ready-for-review)"
echo ""

read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Creating labels..."
echo ""

# Read labels from JSON and create them
while IFS= read -r line; do
    # Extract values using simple parsing
    if [[ $line =~ \"name\":\ \"([^\"]+)\" ]]; then
        name="${BASH_REMATCH[1]}"
    fi
    if [[ $line =~ \"color\":\ \"([^\"]+)\" ]]; then
        color="${BASH_REMATCH[1]}"
    fi
    if [[ $line =~ \"description\":\ \"([^\"]+)\" ]]; then
        description="${BASH_REMATCH[1]}"
        
        # Create the label
        if gh label create "$name" --color "$color" --description "$description" --force 2>/dev/null; then
            echo "✅ Created: $name"
        else
            echo "⚠️  Skipped: $name (may already exist)"
        fi
    fi
done < github-labels.json

echo ""
echo "✅ Done! Your repository now has standardized labels."
echo ""
echo "You can view them at: https://github.com/$REPO/labels"