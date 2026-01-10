#!/bin/bash

# Push to GitHub with Token Authentication
# Usage: GITHUB_TOKEN=your_token ./push-with-token.sh

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🚀 PUSHING TO GITHUB WITH TOKEN                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  GITHUB_TOKEN environment variable not set"
    echo ""
    echo "To use this script:"
    echo "  1. Create a Personal Access Token at: https://github.com/settings/tokens"
    echo "  2. Select scope: 'repo'"
    echo "  3. Run: GITHUB_TOKEN=your_token_here ./push-with-token.sh"
    echo ""
    echo "Or set it permanently:"
    echo "  export GITHUB_TOKEN=your_token_here"
    echo "  ./push-with-token.sh"
    echo ""
    exit 1
fi

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
echo "📝 Commits ready to push:"
git log --oneline origin/main..HEAD
echo ""
echo "📁 Files to push:"
git diff --stat origin/main..HEAD
echo ""

# Push using token
echo "🔄 Pushing to GitHub..."
echo ""

# Temporarily change remote URL to include token
ORIGINAL_URL=$(git remote get-url origin)
TOKEN_URL="https://${GITHUB_TOKEN}@github.com/sunnysanthosh/study-collab.git"

git remote set-url origin "$TOKEN_URL"

# Push
if git push origin main 2>&1; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    
    # Restore original URL (without token)
    git remote set-url origin "$ORIGINAL_URL"
    
    echo ""
    echo "📊 Verification:"
    echo "   Visit: https://github.com/sunnysanthosh/study-collab"
    echo "   Check that all $AHEAD commits are visible"
    echo ""
    exit 0
else
    ERROR=$?
    # Restore original URL on error
    git remote set-url origin "$ORIGINAL_URL"
    echo ""
    echo "❌ Push failed. Please check:"
    echo "   1. Token is valid and has 'repo' scope"
    echo "   2. Repository exists and you have write access"
    echo "   3. Network connection is working"
    echo ""
    exit $ERROR
fi
