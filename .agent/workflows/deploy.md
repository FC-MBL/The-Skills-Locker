---
description: Push to GitHub and deploy to Cloudflare Pages
---

# Deploy Skills Locker to GitHub and Cloudflare

This workflow deploys The Skills Locker application to GitHub and Cloudflare Pages.

## Prerequisites
- All changes committed that you want to deploy
- Cloudflare Pages project configured to auto-deploy from GitHub `main` branch

## Steps

### 1. Verify git status and ensure everything is committed
```bash
git status
```

### 2. Build the production version locally (optional verification)
```bash
npm run build
```
This creates the `dist` folder with the bundled application.

### 3. Add all changes including the dist folder
```bash
git add .
```

// turbo
### 4. Commit your changes
```bash
git commit -m "deploy: [describe your changes]"
```

// turbo
### 5. Push to GitHub
```bash
git push origin main
```

### 6. Wait for Cloudflare Pages to auto-deploy
- Cloudflare should automatically detect the push and start building
- Check the deployment at: https://dash.cloudflare.com/
- Wait 1-2 minutes for the build to complete

### 7. Verify the deployment
- Navigate to: https://9d59c849.skills-locker.pages.dev/
- Check browser console for errors
- Test both portals:
  - **Client portal:** Login with any email (e.g., `student@test.com`)
  - **Admin portal:** Login with `sarah@skills.com` or `mike@skills.com`

## Important Notes

> **Note:** The `dist` folder is committed to the repository (not in `.gitignore`) because Cloudflare serves the pre-built files. This ensures the deployment is consistent with local builds.

## Troubleshooting

**Blank page after deployment:**
1. Check if `dist` folder is in git
2. Verify `dist/index.html` contains the script tag: `<script type="module" crossorigin src="/assets/index-*.js"></script>`
3. Check Cloudflare build logs for errors
4. Ensure build output directory in Cloudflare is set to `/` or `dist`

**Build fails on Cloudflare:**
- Build command should be: `npm run build`
- Output directory should be: `dist`
- Make sure `dist` folder is committed to git
