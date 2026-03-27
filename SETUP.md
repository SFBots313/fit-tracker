# 🏋️ Fit Tracker — Complete Setup Guide
### GitHub Pages + Firebase + AI Meal Tracker
---

## What You'll Need
- A **GitHub account** → https://github.com (free)
- A **Firebase account** → https://firebase.google.com (free, sign in with Google)
- An **Anthropic API key** → https://console.anthropic.com (you'll add a few dollars of credit — meal analysis costs fractions of a cent per use)
- **Node.js** already installed ✓
- About **30–45 minutes**

---

## PART 1 — Set Up GitHub

### Step 1: Create a new repository
1. Go to https://github.com and sign in (or create a free account)
2. Click the **+** button in the top right → **New repository**
3. Name it: `fit-tracker`
4. Set it to **Public** (required for free GitHub Pages)
5. Click **Create repository**
6. Leave the page open — you'll need the repo URL in a minute

### Step 2: Put the project files on your computer
1. Download this whole `fit-tracker` folder to your computer (e.g. your Desktop)
2. Open **Command Prompt** (Windows: press Win+R, type `cmd`, press Enter)
3. Navigate to the folder:
   ```
   cd Desktop\fit-tracker
   ```
4. Run these commands one at a time:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fit-tracker.git
   git push -u origin main
   ```
   *(Replace YOUR_USERNAME with your actual GitHub username)*

---

## PART 2 — Set Up Firebase

### Step 3: Create a Firebase project
1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Name it `fit-tracker` → Continue
4. Disable Google Analytics (not needed) → **Create project**
5. Wait for it to finish → Click **Continue**

### Step 4: Add a Web App to Firebase
1. On the Firebase project home, click the **</>** (Web) icon
2. App nickname: `fit-tracker-web`
3. Check ✅ **Also set up Firebase Hosting**
4. Click **Register app**
5. You'll see a block of code like this — **copy it somewhere safe** (Notepad is fine):
   ```
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "fit-tracker-xxxxx.firebaseapp.com",
     databaseURL: "https://fit-tracker-xxxxx-default-rtdb.firebaseio.com",
     projectId: "fit-tracker-xxxxx",
     storageBucket: "fit-tracker-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc123"
   };
   ```
6. Click **Next** through the remaining screens

### Step 5: Enable Realtime Database
1. In the left sidebar, click **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose your region (US is fine) → **Next**
4. Select **Start in test mode** → **Enable**

### Step 6: Enable Cloud Functions (for AI meal tracker)
1. In the left sidebar, click **Build** → **Functions**
2. Click **Upgrade project** — Firebase Functions requires the **Blaze (pay-as-you-go)** plan
   - ⚠️ Don't worry — there's a generous free tier (2 million calls/month free). You won't be charged for personal use. Just add a credit card.
3. Follow the prompts to upgrade

---

## PART 3 — Connect Firebase to Your App

### Step 7: Update src/firebase.js
1. Open the file `fit-tracker/src/firebase.js` in any text editor (Notepad, VS Code, etc.)
2. Replace all the `REPLACE_WITH_...` values with the config you copied in Step 4:
   ```js
   const firebaseConfig = {
     apiKey:            "AIza...",           // ← paste yours
     authDomain:        "fit-tracker-xxx...",
     databaseURL:       "https://fit-tracker-xxx...",
     projectId:         "fit-tracker-xxx",
     storageBucket:     "fit-tracker-xxx...",
     messagingSenderId: "123456789",
     appId:             "1:123:web:abc123"
   };
   ```
3. Save the file

---

## PART 4 — Deploy the Cloud Function (AI Meal Tracker)

### Step 8: Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`) — save it safely, you only see it once

### Step 9: Install Firebase CLI and deploy the function
Open Command Prompt and run these one at a time:

```
npm install -g firebase-tools
```
```
cd Desktop\fit-tracker
```
```
firebase login
```
*(This opens a browser — log in with your Google account)*

```
firebase use --add
```
*(Select your fit-tracker project from the list)*

```
cd functions
npm install
cd ..
```

Now set your Anthropic API key as a secure secret (it never touches your code):
```
firebase functions:secrets:set ANTHROPIC_API_KEY
```
*(Paste your `sk-ant-...` key when prompted, press Enter)*

Set your app password as a Firebase secret (same idea as the API key):
```
firebase functions:secrets:set APP_PASSWORD
```
*(Type the password you want — something memorable but not obvious. Press Enter.)*

### Step 9b: Set the same password in App.js
1. Open `fit-tracker/src/App.js`
2. Find this line near the top:
   ```js
   const APP_PASSWORD = "REPLACE_WITH_YOUR_PASSWORD";
   ```
3. Replace it with the exact same password you just set:
   ```js
   const APP_PASSWORD = "YourChosenPassword";
   ```
4. Save the file

Deploy the function:
```
firebase deploy --only functions
```

After it finishes, you'll see a line like:
```
✔  functions[analyzeMeal]: Successful create operation.
Function URL: https://analyzemeal-xxxxxxxx-uc.a.run.app
```
**Copy that URL** — you need it in the next step.

### Step 10: Add the Function URL to the app
1. Open `fit-tracker/src/App.js`
2. Find this line near the top:
   ```js
   const CLOUD_FN_URL = "REPLACE_WITH_YOUR_CLOUD_FUNCTION_URL";
   ```
3. Replace it with your actual URL:
   ```js
   const CLOUD_FN_URL = "https://analyzemeal-xxxxxxxx-uc.a.run.app";
   ```
4. Save the file

---

## PART 5 — Deploy to GitHub Pages

### Step 11: Set your GitHub username in package.json
1. Open `fit-tracker/package.json`
2. Add this line (replace YOUR_USERNAME):
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/fit-tracker",
   ```
   Add it near the top, after `"private": true,`
3. Save the file

### Step 12: Install and deploy
In Command Prompt (in your fit-tracker folder):
```
npm install
npm run deploy
```

This builds the app and pushes it to GitHub Pages automatically. It takes 1–2 minutes.

### Step 13: Enable GitHub Pages
1. Go to your GitHub repo → **Settings** tab
2. Scroll to **Pages** in the left sidebar
3. Under **Branch**, select `gh-pages` → `/(root)` → **Save**
4. Wait 2–3 minutes, then visit:
   ```
   https://YOUR_USERNAME.github.io/fit-tracker
   ```

🎉 **Your app is live!**

---

## PART 6 — Push Code Updates

Whenever you make changes to the app, run these in your fit-tracker folder:
```
git add .
git commit -m "Update app"
git push
npm run deploy
```

---

## How Sharing Works

- Each person who opens the app gets a unique **6-character code** (stored in their browser)
- Hit **"Copy Code"** to copy it to clipboard
- Anyone can enter that code in the **"Load"** box to view that person's progress
- Great for sharing with a trainer, friend, or accountability partner

---

## Costs (Summary)

| Service | Free Tier | You'll Use |
|---------|-----------|------------|
| GitHub Pages | Unlimited for public repos | Free |
| Firebase Hosting | 10GB/month | Free |
| Firebase Realtime DB | 1GB storage, 10GB/month transfer | Free |
| Firebase Functions | 2M calls/month | Free |
| Anthropic API | Pay per use | ~$0.001 per meal log |

For personal use, this will essentially be **free** indefinitely.

---

## Troubleshooting

**"npm not found"** → Make sure Node.js is installed: https://nodejs.org

**"Permission denied" on firebase login** → Run Command Prompt as Administrator

**Meal analyzer not working** → Double-check the CLOUD_FN_URL in App.js matches exactly what Firebase printed

**Page shows blank** → Check that `homepage` in package.json matches your GitHub username exactly

**Data not saving** → Make sure your Firebase databaseURL in firebase.js ends with `.firebaseio.com` and starts with `https://`

---

Need help? Bring this guide back to Claude with any error messages and we'll sort it out.
