# Vercel Environment Setup Guide

This guide explains how to set up and use Vercel environment variables with the Vendibook project.

## Prerequisites

- Node.js and npm installed
- A Vercel account (sign up at https://vercel.com)
- The repository cloned locally

## Initial Setup

### 1. Install Dependencies

First, make sure all dependencies are installed:

```bash
npm install
```

This will install the Vercel CLI as a dev dependency.

### 2. Login to Vercel

Authenticate with your Vercel account:

```bash
npx vercel login
```

Follow the prompts to log in via your browser.

### 3. Link Your Local Project to Vercel

Link your local repository to your Vercel project:

```bash
npx vercel link
```

You'll be prompted to:
- Select your Vercel scope (your personal account or a team)
- Confirm or search for your project
- Link the current directory to the Vercel project

This creates a `.vercel` directory locally (which is gitignored) containing project configuration.

## Pulling Environment Variables

### Development Environment

To pull development environment variables from Vercel:

```bash
npm run env:pull
```

This command:
- Connects to your Vercel project
- Downloads environment variables configured for the "Development" environment
- Creates or updates `.env.development.local` file
- This file is automatically gitignored and safe for local development

### Production Environment

To pull production environment variables:

```bash
npm run env:pull:production
```

This creates or updates `.env.production.local` with production values.

## Managing Environment Variables in Vercel

### Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add variables with these options:
   - **Development**: Used by `npm run env:pull`
   - **Preview**: Used for preview deployments
   - **Production**: Used by `npm run env:pull:production` and production builds

### Via Vercel CLI

You can also add environment variables via CLI:

```bash
# Add a development variable
npx vercel env add DATABASE_URL development

# Add a production variable
npx vercel env add DATABASE_URL production

# List all environment variables
npx vercel env ls
```

## Environment File Priority

When running the development server, Vite loads environment variables in this order (later files override earlier ones):

1. `.env` - Committed to git, base values
2. `.env.local` - Not committed, local overrides
3. `.env.development` - Development-specific, can be committed
4. `.env.development.local` - Development-specific, not committed (pulled from Vercel)

## Security Best Practices

✅ **DO:**
- Use `npm run env:pull` to get latest variables from Vercel
- Keep sensitive values only in Vercel dashboard
- Use `.env.example` to document required variables (without sensitive values)
- Commit `.env.example` to git as documentation

❌ **DON'T:**
- Never commit `.env.development.local` or `.env.production.local`
- Don't put real secrets in `.env.example`
- Don't share your `.vercel` directory (it's gitignored)

## Troubleshooting

### "Error: No team or user specified"

Run `npx vercel link` to link your project first.

### "Error: Not authenticated"

Run `npx vercel login` to authenticate.

### "Error: Project not found"

Make sure you've created the project in Vercel dashboard or deployed it at least once.

### Variables not loading in development

1. Make sure the file `.env.development.local` exists
2. Restart your dev server (`npm run dev`)
3. Check that variables are prefixed correctly (Vite requires `VITE_` prefix for client-side variables)

## Example Workflow

Here's a typical workflow for a new developer joining the project:

```bash
# 1. Clone the repository
git clone https://github.com/Sharbi4/vendibook.git
cd vendibook

# 2. Install dependencies
npm install

# 3. Login to Vercel
npx vercel login

# 4. Link to Vercel project
npx vercel link

# 5. Pull environment variables
npm run env:pull

# 6. Start development
npm run dev
```

## Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
