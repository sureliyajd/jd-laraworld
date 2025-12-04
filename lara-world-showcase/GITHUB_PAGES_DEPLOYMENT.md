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