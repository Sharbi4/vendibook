# Vendibook Marketplace

Vendibook is a Vite-powered React application that showcases a rental marketplace for food trucks, trailers, ghost kitchens, and related mobile businesses. The project currently focuses on a client-side experience with React Router managing navigation across the major marketplace flows (listings, detail pages, and host onboarding tools).

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   You have two options:

   **Option A: Copy from example (for local development)**
   ```bash
   cp .env.example .env.development.local
   # Then edit .env.development.local with your actual values
   ```

   **Option B: Pull from Vercel (if project is linked)**
   ```bash
   npm run env:pull
   ```
   
   This will download environment variables from Vercel and create `.env.development.local`. 
   
   **Note:** Before running this command, you must:
   - Link your local project to Vercel: `npx vercel link`
   - Be authenticated with Vercel: `npx vercel login`

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

## Vercel Environment Variables

This project uses Vercel for deployment and can pull environment variables directly from your Vercel project.

For detailed setup instructions, see [VERCEL_SETUP.md](./VERCEL_SETUP.md).

### Setup Steps:

1. **Login to Vercel CLI**
   ```bash
   npx vercel login
   ```

2. **Link your local project to Vercel**
   ```bash
   npx vercel link
   ```
   This will prompt you to select your Vercel team and project.

3. **Pull environment variables**
   ```bash
   npm run env:pull
   ```
   This creates `.env.development.local` with your development environment variables from Vercel.

   For production variables:
   ```bash
   npm run env:pull:production
   ```

### Available Scripts:

- `npm run env:pull` - Pull development environment variables from Vercel
- `npm run env:pull:production` - Pull production environment variables from Vercel

### Managing Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add your variables for different environments (Development, Preview, Production)
4. Pull them locally using the scripts above

**Note:** The `.env.development.local` and `.env.production.local` files are gitignored and will not be committed to your repository.

## Project Structure Highlights

- `src/App.jsx`: Registers React Router routes for home, listings, listing detail, and host flows.
- `src/pages/`: Contains page-level React components for Home, Listings, Listing Detail, Become a Host landing, Host onboarding wizard, and Host dashboard.
- `src/data/`, `src/hooks/`, and supporting directories: House reusable data helpers and hooks as the marketplace grows.

For any discrepancies or unexpected shell errors (e.g., `cd: too many arguments`), rerun the command without inline comments or extra text, then report the exact output for troubleshooting.
