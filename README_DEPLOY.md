# How to Deploy to GitHub Pages

I have configured your app for GitHub Pages deployment using GitHub Actions.

## Steps to Deploy:

1.  **Create a GitHub Repository**: Create a new repository on GitHub.
2.  **Push your code**:
    *   Initialize git: `git init`
    *   Add files: `git add .`
    *   Commit: `git commit -m "Initial commit"`
    *   Add remote: `git remote add origin YOUR_REPO_URL`
    *   Push: `git push -u origin main`
3.  **Set up Secrets**:
    *   In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
    *   Click **New repository secret**.
    *   Name: `VITE_GOOGLE_SHEET_URL`
    *   Value: Paste your Google Sheet CSV link.
4.  **Enable GitHub Pages**:
    *   Go to **Settings > Pages**.
    *   Under **Build and deployment > Source**, select **GitHub Actions**.
5.  **Wait for Build**:
    *   Go to the **Actions** tab to see your deployment progress.
    *   Once finished, your site will be live at `https://<your-username>.github.io/<your-repo-name>/`.

## Important Note on Images
If you are using local images in `/public/images/`, make sure they are pushed to GitHub. If you are using external links in your Google Sheet, they will work automatically!
