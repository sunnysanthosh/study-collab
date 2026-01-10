# GitHub Push Authentication Guide

**Status:** 5 commits ready to push  
**Repository:** https://github.com/sunnysanthosh/study-collab  
**Branch:** main

---

## 🔐 Authentication Required

Git push requires authentication. Choose one of the methods below:

---

## Method 1: Personal Access Token (Recommended) ⭐

### Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `StudyCollab Push Token`
4. Select expiration: Choose your preference (90 days recommended)
5. **Select scope:** Check `repo` (this gives full repository access)
6. Click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push Using Token

**Option A: Using the provided script (easiest)**
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
GITHUB_TOKEN=your_token_here ./push-with-token.sh
```

**Option B: Direct git command**
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
git push https://your_token_here@github.com/sunnysanthosh/study-collab.git main
```

**Option C: Set token as environment variable (persistent)**
```bash
# Add to ~/.zshrc or ~/.bashrc
export GITHUB_TOKEN=your_token_here

# Then push
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
./push-with-token.sh
```

---

## Method 2: GitHub CLI

### Step 1: Install GitHub CLI
```bash
brew install gh
```

### Step 2: Authenticate
```bash
gh auth login
# Follow the prompts:
# - Select: GitHub.com
# - Select: HTTPS
# - Authenticate: Login with web browser
# - Select: Yes for git credential helper
```

### Step 3: Push
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
git push origin main
```

---

## Method 3: SSH Key (Long-term solution)

### Step 1: Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter for default location
# Enter a passphrase (recommended) or leave empty
```

### Step 2: Add SSH Key to GitHub

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Go to: https://github.com/settings/keys
3. Click **"New SSH key"**
4. Give it a title: `StudyCollab - MacBook`
5. Paste your public key
6. Click **"Add SSH key"**

### Step 3: Configure Git to Use SSH
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
git remote set-url origin git@github.com:sunnysanthosh/study-collab.git
```

### Step 4: Test Connection
```bash
ssh -T git@github.com
# Should see: Hi sunnysanthosh! You've successfully authenticated...
```

### Step 5: Push
```bash
git push origin main
```

---

## Method 4: macOS Keychain (HTTPS)

### Step 1: Store Credentials in Keychain
```bash
# This will prompt for username and password
git credential-osxkeychain store
# Enter:
# protocol=https
# host=github.com
# username=your_github_username
# password=your_personal_access_token  # Use token, not password!
```

### Step 2: Push
```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
git push origin main
```

---

## 🚀 Quick Start (Fastest Method)

**If you have a Personal Access Token:**

```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
GITHUB_TOKEN=paste_your_token_here ./push-with-token.sh
```

---

## ✅ Verification After Push

After successfully pushing, verify:

1. **Check GitHub Repository:**
   Visit: https://github.com/sunnysanthosh/study-collab

2. **Verify Commits:**
   - Should see 5 new commits:
     - docs: Add PROJECT_STATUS.md
     - chore: Add .gitkeep files
     - docs: Add push instructions
     - chore: Add automated push script
     - docs: Add artifacts verification report

3. **Verify Files:**
   - PROJECT_STATUS.md should be in root
   - backend/api/logs/.gitkeep should exist
   - backend/api/uploads/.gitkeep should exist
   - PUSH_INSTRUCTIONS.md should exist
   - push-to-github.sh should exist
   - ARTIFACTS_VERIFICATION.md should exist

4. **Verify Tags:**
   All tags should be present: v0.1, v0.2, v0.4, v0.5, v0.5.1

---

## 🔒 Security Notes

- **Never commit tokens or passwords** to git
- **Use tokens instead of passwords** for HTTPS authentication
- **Set token expiration** dates appropriately
- **Revoke unused tokens** regularly
- **Use SSH keys** for long-term authentication

---

## 📚 Additional Resources

- GitHub Personal Access Tokens: https://github.com/settings/tokens
- GitHub SSH Keys: https://github.com/settings/keys
- GitHub CLI: https://cli.github.com/
- Git Credential Helpers: https://git-scm.com/docs/gitcredentials

---

## 🆘 Troubleshooting

### "fatal: could not read Username"
- **Solution:** Use Method 1 (Personal Access Token) with the provided script

### "Permission denied (publickey)"
- **Solution:** Set up SSH keys (Method 3) or use HTTPS with token (Method 1)

### "Authentication failed"
- **Solution:** Check that token has `repo` scope enabled
- **Solution:** Verify token hasn't expired
- **Solution:** Regenerate token if needed

### "Repository not found"
- **Solution:** Verify repository URL is correct
- **Solution:** Check you have write access to the repository

---

**Ready to push? Choose a method above and follow the steps!**
