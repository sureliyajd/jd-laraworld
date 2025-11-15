# GitHub Pages Deployment Guide

Your `lara-world-showcase` frontend has been configured for GitHub Pages deployment.

## Configuration Summary

✅ **Repository Name Detected:** `jd-laraworld`  
✅ **gh-pages package installed** as a dev dependency  
✅ **npm scripts added:** `predeploy` and `deploy`  
✅ **Vite config updated** with base path: `/jd-laraworld/`

## Files Modified

1. **package.json**
   - Added `gh-pages` to devDependencies
   - Added `predeploy` script: runs `npm run build` before deployment
   - Added `deploy` script: deploys the `dist` folder to `gh-pages` branch

2. **vite.config.ts**
   - Added `base: "/jd-laraworld/"` for correct asset paths on GitHub Pages

## How to Deploy

1. **Navigate to the frontend folder:**
   ```bash
   cd lara-world-showcase
   ```

2. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

   This command will:
   - Automatically run `npm run build` (via `predeploy` hook)
   - Create/update the `gh-pages` branch
   - Push the `dist` folder contents to the `gh-pages` branch

## GitHub Pages Setup

After running `npm run deploy`, you need to configure GitHub Pages:

1. Go to your repository on GitHub: `https://github.com/sureliyajd/jd-laraworld`
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select:
   - **Branch:** `gh-pages`
   - **Folder:** `/ (root)`
4. Click **Save**

## Live URL

Once configured, your site will be available at:

**https://sureliyajd.github.io/jd-laraworld/**

## Important Notes

- The `base` path in `vite.config.ts` must match your repository name (`/jd-laraworld/`)
- Always run `npm run deploy` from the `lara-world-showcase` directory
- The deployment creates/updates the `gh-pages` branch automatically
- Changes may take a few minutes to appear on GitHub Pages
- The `gh-pages` branch is separate from your `main` branch and only contains the built files

## Troubleshooting

### 404 Not Found Error

If you're getting a 404 error, check the following:

1. **Verify GitHub Pages is configured:**
   - Go to: `https://github.com/sureliyajd/jd-laraworld/settings/pages`
   - Ensure **Source** is set to: `gh-pages` branch → `/ (root)`
   - If it says "Your site is ready to be published", click **Save** to activate it

2. **Check if `gh-pages` branch exists:**
   ```bash
   git branch -a | grep gh-pages
   ```
   - If it doesn't exist, run `npm run deploy` from the `lara-world-showcase` folder

3. **Verify `.nojekyll` file is present:**
   - The `.nojekyll` file is now automatically created during deployment
   - This file tells GitHub Pages not to process files with Jekyll (required for Vite/React apps)

4. **Ensure repository is public (or you have GitHub Pro):**
   - GitHub Pages free tier only works with public repositories
   - Private repos require GitHub Pro account

5. **Wait a few minutes:**
   - GitHub Pages can take 1-5 minutes to build and deploy
   - Check the Actions tab in your repository for build status

6. **Check the URL:**
   - Ensure you're visiting: `https://sureliyajd.github.io/jd-laraworld/`
   - Note the trailing slash - it's important!

7. **Clear browser cache:**
   - Try an incognito/private window
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### Other Common Issues

- **Broken Assets:** Verify the `base` path in `vite.config.ts` matches your repository name (`/jd-laraworld/`)
- **Deployment Issues:** Make sure you're logged into GitHub CLI or have proper Git credentials configured
- **Build Errors:** Check the build output when running `npm run deploy` - look for any errors in the console

### Manual Deployment Steps

If automatic deployment isn't working:

```bash
cd lara-world-showcase
npm run build
touch dist/.nojekyll
npx gh-pages -d dist
```

Then verify on GitHub:
1. Go to repository → **Settings** → **Pages**
2. Confirm `gh-pages` branch is selected
3. Wait 1-5 minutes for GitHub to build

