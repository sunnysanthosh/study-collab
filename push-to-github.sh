#!/bin/bash

# Push to GitHub Script
# This script helps push commits to GitHub with proper authentication

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🚀 PUSHING TO GITHUB                                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if there are commits to push
AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
if [ "$AHEAD" -eq "0" ]; then
    echo "✅ No commits to push. Everything is up to date!"
    exit 0
fi

echo "📦 Commits to push: $AHEAD"
echo ""

# Show commits
echo "📝 Commits ready to push:"
git log --oneline origin/main..HEAD
echo ""

# Show files
echo "📁 Files to push:"
git diff --stat origin/main..HEAD
echo ""

# Try to push
echo "🔄 Attempting to push to GitHub..."
echo ""

# Method 1: Try direct push (might work if credentials are cached)
if git push origin main 2>&1 | tee /tmp/git-push-output.txt; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    exit 0
fi

# Check the error
if grep -q "could not read Username" /tmp/git-push-output.txt; then
    echo ""
    echo "⚠️  Authentication required. Choose a method:"
    echo ""
    echo "Option 1: Personal Access Token (Recommended)"
    echo "   1. Create a token at: https://github.com/settings/tokens"
    echo "   2. Select scope: 'repo'"
    echo "   3. Run: git push https://<YOUR_TOKEN>@github.com/sunnysanthosh/study-collab.git main"
    echo ""
    echo "Option 2: SSH Key Setup"
    echo "   1. Generate SSH key: ssh-keygen -t ed25519 -C 'your_email@example.com'"
    echo "   2. Add to GitHub: https://github.com/settings/keys"
    echo "   3. Run: git remote set-url origin git@github.com:sunnysanthosh/study-collab.git"
    echo "   4. Run: git push origin main"
    echo ""
    echo "Option 3: GitHub CLI"
    echo "   1. Install: brew install gh"
    echo "   2. Authenticate: gh auth login"
    echo "   3. Run: git push origin main"
    echo ""
    echo "📋 Current remote URL: $(git remote get-url origin)"
    echo ""
    exit 1
fi

exit 1
