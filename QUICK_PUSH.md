# Quick Push Guide - Where to Provide Your GitHub Token

## 🚀 Fastest Method (Recommended)

**Copy and paste this command, replacing `YOUR_TOKEN_HERE` with your actual token:**

```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab && GITHUB_TOKEN=YOUR_TOKEN_HERE ./push-with-token.sh
```

### Step-by-Step:

1. **Open your terminal**
2. **Navigate to the project directory:**
   ```bash
   cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
   ```

3. **Run the push command with your token:**
   ```bash
   GITHUB_TOKEN=ghp_your_actual_token_here ./push-with-token.sh
   ```
   
   Replace `ghp_your_actual_token_here` with your actual token that starts with `ghp_`

4. **Press Enter** and wait for the push to complete

---

## 📝 Example

If your token is `ghp_1234567890abcdef1234567890abcdef12345678`, the command would be:

```bash
cd /Users/santhoshsrinivas/MyApps/iLearn/study-collab
GITHUB_TOKEN=ghp_1234567890abcdef1234567890abcdef12345678 ./push-with-token.sh
```

---

## ✅ What Happens Next

After running the command, you'll see:
- A list of commits being pushed
- Files being pushed
- Push progress
- Success message when complete

Then verify on GitHub: https://github.com/sunnysanthosh/study-collab

---

## 🔒 Security

- The script automatically removes the token from git config after pushing
- Your token is only used for authentication, never stored
- The token is passed as an environment variable, not saved in history (if you use inline method)

---

## 🆘 Troubleshooting

**If you get "permission denied":**
- Make sure your token has the `repo` scope enabled
- Check that you copied the entire token correctly

**If you get "not found":**
- Verify the repository URL is correct
- Check that you have write access to the repository

**If you get "authentication failed":**
- Your token may have expired
- Generate a new token at: https://github.com/settings/tokens

---

**Ready? Just paste your token into the command above and run it!**
