# Vendibook Marketplace

Vendibook is a Vite-powered React application that showcases a rental marketplace for food trucks, trailers, ghost kitchens, and related mobile businesses. The project currently focuses on a client-side experience with React Router managing navigation across the major marketplace flows (listings, detail pages, and host onboarding tools).

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Choose one of the following methods:

   **Option A: Pull from Vercel (Recommended for team members)**
   ```bash
   npm run env:pull
   ```
   This will pull environment variables from Vercel and create a `.env.development.local` file.
   
   **Option B: Manual setup**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values.

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Create a production build**
   ```bash
   npm run build
   ```

## Repository Verification

If you are working from a local machine and need to confirm that you are inside the correct Git repository:

1. Open a terminal and change into the repo folder (e.g., `vendibook`). Run the command without inline comments to avoid shell errors:
   ```bash
   cd ~/vendibook
   ```
2. Verify the Git remote configuration:
   ```bash
   git remote -v
   ```
   You should see `origin` pointing to `https://github.com/Sharbi4/vendibook.git` for both fetch and push URLs.

## Working in VS Code with AI Assistants

1. Open VS Code and choose **File → Open Folder**, then select the `vendibook` directory verified above.
2. Ensure the explorer shows folders such as `src/`, `api/` (if present), `package.json`, and other project assets.
3. Run your AI prompts from within this workspace so that file changes apply directly to the real repository. The assistant panel should display a root similar to `.../vendibook` before you execute prompts.

## Build, Commit, and Deploy

1. From the integrated terminal in VS Code, run `npm run build` to ensure the project compiles.
2. Review file changes with `git status`, stage them (`git add .`), then commit and push:
   ```bash
   git commit -m "feat: vendibook marketplace updates"
   git push origin main
   ```
3. After pushing, verify the update on GitHub and confirm that Vercel triggers a new deployment from the `main` branch.

## Project Structure Highlights

- `src/App.jsx`: Registers React Router routes for home, listings, listing detail, and host flows.
- `src/pages/`: Contains page-level React components for Home, Listings, Listing Detail, Become a Host landing, Host onboarding wizard, and Host dashboard.
- `src/data/`, `src/hooks/`, and supporting directories: House reusable data helpers and hooks as the marketplace grows.

For any discrepancies or unexpected shell errors (e.g., `cd: too many arguments`), rerun the command without inline comments or extra text, then report the exact output for troubleshooting.
