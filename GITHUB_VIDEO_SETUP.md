# 🎥 GitHub Video Storage Setup (FREE!)

Use GitHub as **free video hosting** instead of paid services like Cloudflare Stream or Mux!

## ✅ Advantages

- 🆓 **Completely FREE** - No credit card required
- 🚀 **Easy to set up** - Just 3 steps
- 🌍 **Global CDN** - GitHub serves files worldwide via raw.githubusercontent.com
- 🔒 **Secure** - Private repositories supported
- ♾️ **Generous limits** - Perfect for educational platforms

## ⚠️ Important Limitations

- **File size limit**: 100 MB per file (GitHub standard limit)
- **Repository size**: Keep total repo under 1 GB recommended
- **Best for**: Small to medium-sized educational videos
- **For larger files**: Consider using Git LFS (Large File Storage) or splitting videos

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository:
   - **Name**: `qdeeh-videos` (or any name you prefer)
   - **Visibility**: 
     - **Public** ✅ (Free, videos publicly accessible via URL)
     - **Private** ✅ (Requires authentication, but works)
   - **Initialize**: Add a README (recommended)
3. Click **Create repository**

### Step 2: Generate Personal Access Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Configure token:
   - **Note**: `QdeehAi Video Upload`
   - **Expiration**: `No expiration` or `90 days`
   - **Select scopes**: ✅ Check **`repo`** (Full control of private repositories)
4. Click **Generate token**
5. **IMPORTANT**: Copy the token NOW! (You won't see it again)

### Step 3: Configure Environment Variables

Open your `.env` file and add:

```env
# GitHub Video Storage (FREE!)
GITHUB_REPO_OWNER="your-github-username"      # e.g., "johnsmith"
GITHUB_REPO_NAME="qdeeh-videos"               # The repo name you created
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"       # The token you just created
GITHUB_BRANCH="main"                          # Usually "main" or "master"
```

**Example:**
```env
GITHUB_REPO_OWNER="johnsmith"
GITHUB_REPO_NAME="qdeeh-videos"
GITHUB_TOKEN="ghp_1234567890abcdefghijklmnopqrstuvwxyz"
GITHUB_BRANCH="main"
```

### Step 4: Restart Your Server

```bash
npm run dev
```

---

## 🎬 How to Upload Videos

1. Go to **Admin Dashboard**: http://localhost:3000/admin-dashboard-secret/videos
2. Click the **Upload** tab
3. Select a course and lesson
4. **Drag & drop** your video file (or click to browse)
5. Video uploads to GitHub automatically!
6. Video URL is saved to the lesson

### Supported Video Formats
- ✅ MP4 (recommended)
- ✅ MOV
- ✅ WebM
- ✅ AVI
- ✅ MKV

### File Size Limits
- **Maximum**: 100 MB per file
- **Recommended**: 50 MB or less for best performance
- **Tip**: Compress videos before uploading using tools like HandBrake

---

## 🔍 How It Works

### Upload Process:
1. Admin uploads video through the dashboard
2. Video is encoded to base64
3. File is pushed to your GitHub repository under `videos/` folder
4. GitHub API returns the file URL
5. Video is accessible via `raw.githubusercontent.com`

### Video URL Format:
```
https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/videos/FILENAME.mp4
```

### Video Playback:
- Videos are streamed directly from GitHub's CDN
- Works with standard HTML5 `<video>` player
- No additional configuration needed

---

## 📊 GitHub Repository Structure

After uploading videos, your repository will look like:

```
qdeeh-videos/
├── README.md
└── videos/
    ├── 1707654321000_introduction.mp4
    ├── 1707654322000_lesson1.mp4
    └── 1707654323000_lesson2.mp4
```

Files are automatically timestamped to prevent conflicts.

---

## 🎓 Best Practices

### 1. Optimize Videos Before Upload
- Use H.264 codec for maximum compatibility
- Recommended resolution: 720p or 1080p
- Target bitrate: 2-5 Mbps
- Tools: HandBrake, FFmpeg

### 2. Keep Videos Under 100MB
```bash
# Example: Compress video using FFmpeg
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k output.mp4
```

### 3. Use Public Repository for Public Courses
- Faster access (no authentication needed)
- Better for free courses
- Videos accessible to enrolled students

### 4. Use Private Repository for Premium Content
- Extra security
- Requires GitHub token for access
- Better for paid courses

---

## 🔧 Troubleshooting

### Error: "File too large"
**Problem**: Video exceeds 100MB limit  
**Solution**: 
- Compress the video
- Split into smaller parts
- Consider Git LFS (see below)

### Error: "GitHub storage not configured"
**Problem**: Environment variables not set  
**Solution**: Check your `.env` file has all GitHub variables

### Error: "Authentication failed"
**Problem**: Invalid GitHub token  
**Solution**: 
1. Verify token has `repo` permissions
2. Generate a new token if expired
3. Update `GITHUB_TOKEN` in `.env`

### Videos not playing
**Problem**: Wrong URL or private repo  
**Solution**: 
- Check video URL in browser
- For private repos, ensure token has access
- Try making repository public

---

## 🚀 Advanced: Using Git LFS (For Large Files)

If you need to upload files **larger than 100MB**, use Git LFS:

### Setup Git LFS:

1. **Install Git LFS**:
```bash
git lfs install
```

2. **In your video repository**:
```bash
cd qdeeh-videos
git lfs track "*.mp4"
git lfs track "*.mov"
git add .gitattributes
git commit -m "Track videos with Git LFS"
```

3. **Git LFS Free Tier**:
- 1 GB storage
- 1 GB bandwidth/month
- Perfect for small educational platforms

---

## 💡 Alternative Free Solutions

If GitHub doesn't meet your needs:

| Service | Free Tier | Limits | Best For |
|---------|-----------|--------|----------|
| **GitHub** | ✅ Unlimited | 100MB/file | Small videos |
| **Git LFS** | 1 GB storage | 1 GB bandwidth/month | Medium videos |
| **YouTube** | ✅ Unlimited | Public/Unlisted | Large videos, but public |
| **Cloudinary** | 25 GB storage | 25 GB bandwidth/month | Professional |
| **Bunny.net** | 10 GB storage | 50 GB bandwidth/month | Good balance |

---

## 📞 Need Help?

Common questions:

**Q: Can I use multiple repositories?**  
A: Yes, but you'll need to update the code to support multiple repos.

**Q: Is this secure for premium courses?**  
A: For private repos, yes. But consider signed URLs for better security.

**Q: What about bandwidth limits?**  
A: GitHub doesn't have strict bandwidth limits for raw file access, but don't abuse it.

**Q: Can I migrate to Cloudflare later?**  
A: Yes! The app supports multiple providers. Just update your `.env` file.

---

## ✅ Quick Checklist

- [ ] Created GitHub repository
- [ ] Generated Personal Access Token with `repo` permissions
- [ ] Added credentials to `.env` file
- [ ] Restarted development server
- [ ] Tested video upload
- [ ] Verified video playback

---

## 🎉 You're All Set!

Your platform now uses **FREE GitHub video hosting**! 

**Next steps:**
1. Upload some test videos
2. Check they play correctly
3. Optimize your videos for web
4. Start building your course content!

**Links:**
- 📹 **Upload Videos**: http://localhost:3000/admin-dashboard-secret/videos
- 📚 **Your GitHub Repo**: https://github.com/YOUR_USERNAME/qdeeh-videos
- 🔑 **GitHub Tokens**: https://github.com/settings/tokens

---

**Need paid solution?** You can always switch to Cloudflare Stream or Mux later by just updating your `.env` file. The app supports all three providers!
