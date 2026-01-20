# Deploying Skills Locker to Cloudflare Pages

## Option 1: Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Pages Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Navigate to: **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**

2. **Connect GitHub Repository**
   - Select **The-Skills-Locker** repository
   - Click **Begin setup**

3. **Configure Build Settings**
   ```
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

4. **Deploy**
   - Click **Save and Deploy**
   - Cloudflare will build and deploy automatically
   - You'll get a URL like: `https://skills-locker.pages.dev`

---

## Option 2: Manual CLI Deployment

If you prefer using Wrangler CLI:

### First-time Setup

1. **Login to Cloudflare**
   ```bash
   npx wrangler login
   ```

2. **Create the Pages Project** (via dashboard first, or use this command)
   ```bash
   npx wrangler pages project create skills-locker
   ```

3. **Deploy**
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name=skills-locker --commit-dirty=true
   ```

### Subsequent Deployments

```bash
npm run build
npx wrangler pages deploy dist --project-name=skills-locker
```

---

## Option 3: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=skills-locker
```

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN` (create at: https://dash.cloudflare.com/profile/api-tokens)
- `CLOUDFLARE_ACCOUNT_ID` (find in dashboard URL)

---

## Current Status

✅ **Code is ready for deployment**
- Production build created in `dist/` folder
- All code pushed to GitHub (main branch)
- Build succeeds locally (`npm run build`)

⚠️ **Next step:** Choose one of the deployment options above

**Recommended:** Use **Option 1** (Cloudflare Dashboard) for simplicity.

---

## Post-Deployment

Once deployed, the app will be available at your Cloudflare Pages URL.

**Demo Login:** Enter any email address to log in as ADMIN (demo mode).

**Next Steps:**
- Populate sample course data
- Build course form and course builder UI
- Add question bank functionality
- Implement cohort management
