# 🚀 GitHub Video Hosting - Quick Start (3 Minutes)

## What Changed?

✅ **FREE Video Hosting** - Your app now supports GitHub instead of paid Cloudflare Stream!

---

## Setup in 3 Steps

### Step 1: Create GitHub Repository (1 minute)

1. Go to https://github.com/new
2. Repository name: `qdeeh-videos` (or any name)
3. Make it **Public** (for easier access) or **Private** (more secure)
4. Click **Create repository**

### Step 2: Get GitHub Token (1 minute)

1. Go to https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Name: `QdeehAi Video Upload`
4. Select scope: ✅ **repo** (check the box)
5. Click **Generate token**
6. **COPY THE TOKEN** (you won't see it again!)

### Step 3: Update .env File (1 minute)

Open your `.env` file and add:

```env
GITHUB_REPO_OWNER="your-username"        # Your GitHub username
GITHUB_REPO_NAME="qdeeh-videos"          # The repo you created
GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"         # The token you copied
GITHUB_BRANCH="main"                     # Usually "main"
```

**Example:**
```env
GITHUB_REPO_OWNER="johnsmith"
GITHUB_REPO_NAME="qdeeh-videos"
GITHUB_TOKEN="ghp_1234567890abcdefghijklmnopqrstuvwxyz"
GITHUB_BRANCH="main"
```

---

## Done! 🎉

Restart your dev server:
```bash
npm run dev
```

Now go to: http://localhost:3000/admin-dashboard-secret/videos

Upload your first video for **FREE**! 🎥

---

## Important Notes

- **File limit**: 100 MB per video (GitHub's limit)
- **Compress videos** if they're too large (use HandBrake)
- **For larger files**: See full guide in `GITHUB_VIDEO_SETUP.md`

---

## Need Help?

### Videos not uploading?
1. Check your `.env` file has all 4 GitHub variables
2. Restart your dev server
3. Make sure the token has `repo` permissions

### File too large?
Compress your video:
- Use HandBrake: https://handbrake.fr/
- Target: 720p, H.264 codec, 2-5 Mbps

### Want to switch back to Cloudflare?
Just comment out the GitHub variables in `.env` and uncomment Cloudflare ones!

---

**Full documentation**: See `GITHUB_VIDEO_SETUP.md` for advanced features and troubleshooting.
