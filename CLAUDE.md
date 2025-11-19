# CLAUDE.md - Vendibook Developer Guide for AI Assistants

## Project Overview

**Vendibook** is a mobile business rental platform focused on food trucks, trailers, and ghost kitchens. The current implementation is a React-based landing page MVP showcasing the core concept.

- **Project Type:** Frontend Web Application (SPA)
- **Current Version:** 1.0.0
- **Primary Purpose:** Landing page for mobile business rental marketplace
- **Target Market:** Tucson, AZ (and expansion markets)
- **Tech Stack:** React 18 + Vite + Tailwind CSS
- **Repository:** http://local_proxy@127.0.0.1:23854/git/Sharbi4/vendibook

---

## Repository Structure

```
/home/user/vendibook/
├── src/                           # Source files
│   ├── src_App.jsx               # Main React component (root component)
│   ├── src:main.jsx.txt          # React entry point (unusual naming - see conventions)
│   └── src_index.css             # Global CSS reset and typography
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Locked dependency versions
├── vite.config.js                # Vite build configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS config (currently empty)
├── .gitignore                     # Git ignore patterns
├── .gitattributes                 # Git LF normalization
└── .DS_Store                      # macOS system file (should be gitignored)
```

### Important File Naming Conventions

**CRITICAL:** This repository uses non-standard file naming:

- `src_App.jsx` instead of `src/App.jsx`
- `src:main.jsx.txt` instead of `src/main.jsx`
- `src_index.css` instead of `src/index.css`

**When working with files:**
- Always use the exact file paths as they exist
- Do NOT attempt to rename files without explicit user approval
- The `/src/` directory exists but files are named with prefixes instead of being nested

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| react-dom | ^18.2.0 | DOM rendering |
| lucide-react | ^0.294.0 | Icon library |
| vite | ^7.2.2 | Build tool & dev server |
| @vitejs/plugin-react | ^4.2.1 | React JSX transformation |

### Build & Development Tools

- **Build Tool:** Vite (fast HMR, ES modules, optimized bundling)
- **Module System:** ES Modules (type: "module" in package.json)
- **Styling:** Tailwind CSS (configured but NOT actively used - see styling conventions)
- **Icons:** Lucide React (currently uses: Truck, Search imported but unused)

### Missing Production Dependencies

The following are **NOT** included but may be needed for production:
- No state management (Redux, Zustand, Context API)
- No routing library (React Router)
- No HTTP client (axios, fetch wrapper)
- No form handling (react-hook-form, Formik)
- No testing framework (Jest, Vitest, RTL)
- No backend integration
- No authentication system

---

## Development Workflows

### Available NPM Scripts

```bash
npm run dev      # Start Vite dev server (port 5173, HMR enabled)
npm run build    # Create production build -> dist/
npm run preview  # Preview production build locally
```

### Development Server

- **Port:** 5173 (default Vite)
- **Features:** Hot Module Replacement, Fast Refresh
- **Entry Point:** index.html → /src/main.jsx → App.jsx
- **Auto-reload:** Changes to .jsx, .css files trigger instant updates

### Build Process

1. Vite bundles all React components
2. Transpiles JSX to JavaScript via Babel
3. Minifies and optimizes for production
4. Outputs to `dist/` directory
5. Creates hashed filenames for cache busting

**Build Output Structure:**
```
dist/
├── index.html
├── assets/
│   ├── main.[hash].js
│   └── main.[hash].css
```

---

## Code Architecture & Patterns

### Current Architecture

**Type:** Monolithic single-component application

**Component Hierarchy:**
```
App (Root Component)
├── Header
│   ├── Logo (Truck icon + text)
│   └── Sign Up Button
├── Hero Section
│   ├── Headline
│   └── Subheadline
└── Featured Listings Section
    └── Grid of 3 hardcoded listing cards
```

### Application Entry Flow

```
index.html (HTML template)
    ↓
/src/main.jsx (React initialization)
    ↓
ReactDOM.createRoot(document.getElementById('root'))
    ↓
<React.StrictMode>
    <App />
</React.StrictMode>
    ↓
Renders to #root div
```

### Key Files Explained

#### `/home/user/vendibook/src/src_App.jsx` (47 lines)
- **Purpose:** Main and only React component
- **Exports:** Default export of App function component
- **State:** None (useState imported but unused)
- **Props:** None
- **Structure:** Purely presentational component with hardcoded data
- **Styling:** All inline styles (see styling conventions below)

#### `/home/user/vendibook/src/src:main.jsx.txt` (10 lines)
- **Purpose:** React application bootstrap
- **Responsibilities:**
  - Imports React, ReactDOM, App component, and global CSS
  - Creates React root using ReactDOM.createRoot()
  - Renders App wrapped in React.StrictMode
- **StrictMode:** Enabled for development warnings and checks

#### `/home/user/vendibook/src/src_index.css` (8 lines)
- **Purpose:** Global CSS reset and typography
- **Contains:**
  - Universal box-sizing reset
  - Margin/padding reset
  - System font stack for body

---

## Styling Conventions

### CRITICAL: Current Styling Approach

**The project uses INLINE STYLES exclusively** - not CSS classes or Tailwind utilities.

```jsx
// Current pattern in App.jsx
<div style={{ minHeight: '100vh', background: 'white' }}>
  <header style={{ borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
    ...
  </header>
</div>
```

### Tailwind CSS Status

**Configured but NOT used:**
- `tailwind.config.js` exists with custom brand color defined
- Content paths configured: `["./index.html", "./src/**/*.{js,jsx}"]`
- Custom color: `vendibook-orange: '#FF6B35'`
- **NO Tailwind classes are used in App.jsx**

### Design System & Brand Colors

```javascript
// Primary Palette
const COLORS = {
  brandOrange: '#FF6B35',    // Primary brand color
  orangeGradient: '#FF8C42', // Secondary gradient color
  goldAccent: '#FFD700',     // Hero section text highlight
  darkGray: '#1f2937',       // Hero gradient background
  borderGray: '#e5e7eb',     // Borders and dividers
  textGray: '#6b7280',       // Secondary text
  backgroundGray: '#f3f4f6', // Card placeholder backgrounds
};
```

### Typography Scale

```javascript
const TYPOGRAPHY = {
  h1: '48px',      // Hero headline
  h2: '32px',      // Section titles
  logo: '24px',    // Brand logo text
  body: '20px',    // Hero subheadline
  cardTitle: '18px' // Listing card titles
};
```

### Layout Conventions

- **Max-width containers:** 1200px
- **Flexbox:** Used for header layout
- **CSS Grid:** Used for listings (responsive auto-fit)
- **Padding:** Consistent 20px mobile, 60-100px desktop
- **Border radius:** 8px (buttons), 12px (cards)
- **Responsive grid:** `repeat(auto-fit, minmax(300px, 1fr))`

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

---

## Data & State Management

### Current State

**No dynamic state management** - all data is hardcoded.

#### Hardcoded Data

```jsx
// Listings are generated via array mapping
{[1, 2, 3].map((i) => (
  <div key={i}>
    <h3>Food Truck {i}</h3>
    <p>Tucson, AZ</p>
    <p>$250/day</p>
  </div>
))}
```

### Future State Management Needs

When scaling beyond MVP:

1. **Listings Data:** Fetch from backend API
2. **User Session:** Authentication state, user profile
3. **Search/Filters:** Query parameters, filter state
4. **Booking Cart:** Selected listings, dates, checkout
5. **Form State:** Sign up, login, booking forms

**Recommended Libraries:**
- **Simple:** React Context API
- **Medium:** Zustand
- **Complex:** Redux Toolkit

---

## Git Workflow & Branching Strategy

### Current Branch

**Active Branch:** `claude/claude-md-mi60pfo3kytickai-019GgiBGLwkVktbiwL5vykwY`

### Branch Naming Convention

**CRITICAL:** All Claude Code branches MUST:
- Start with `claude/` prefix
- End with matching session ID
- Example: `claude/feature-name-<SESSION_ID>`

**Failure to follow this convention will result in 403 errors on push.**

### Git Operations

#### Pushing Changes

```bash
# ALWAYS use -u flag for new branches
git push -u origin claude/branch-name-with-session-id

# Retry logic for network errors
# If push fails: retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
```

#### Fetching/Pulling

```bash
# Prefer fetching specific branches
git fetch origin <branch-name>

# For pulls
git pull origin <branch-name>

# Apply same retry logic for network failures
```

### Commit Message Patterns

Current commit history shows informal messages:
```
68ea6c1 - commit
730fcc2 - commit
b91cebe - commit
8106cd2 - ommit is pushed, Ver
5bd2eae - index fix commit
```

**Best Practices for AI Assistants:**
- Use clear, descriptive commit messages
- Follow conventional commits format when possible
- Example: `feat: add search functionality to listings`
- Example: `fix: resolve responsive layout on mobile`
- Example: `refactor: extract listing card to separate component`

### Git Configuration

- **Auto GC:** Disabled (`gc.auto=0`)
- **Line Endings:** LF normalization enabled (`.gitattributes`)
- **Remote:** Single origin at local proxy

---

## Component Patterns & Conventions

### React Patterns in Use

1. **Functional Components:** All components use function syntax (no classes)
2. **Hooks:** `useState` imported but not currently used
3. **Props:** Not used (single component app)
4. **Keys:** Properly used in `.map()` operations
5. **StrictMode:** Enabled in main.jsx for development checks

### Code Style Observations

```jsx
// Function component pattern
function App() {
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}

export default App;
```

### Missing Patterns (Opportunities)

- No prop-types or TypeScript for type safety
- No custom hooks
- No component composition (everything in App.jsx)
- No separation of concerns (presentation/container)
- No error boundaries
- No loading states
- No conditional rendering

---

## Testing & Quality Assurance

### Current Status: NO TESTING SETUP

**Missing:**
- No test files (`.test.js`, `.spec.js`)
- No testing framework (Jest, Vitest, RTL)
- No test scripts in package.json
- No coverage reports
- No E2E tests

### Code Quality Tools

**Missing:**
- No ESLint configuration
- No Prettier configuration
- No Stylelint
- No Husky (pre-commit hooks)
- No lint-staged

### Recommendations for Future

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Install linting
npm install -D eslint eslint-plugin-react prettier

# Add scripts to package.json
"test": "vitest"
"lint": "eslint src/"
"format": "prettier --write src/"
```

---

## Environment Configuration

### Current Status: NO ENVIRONMENT VARIABLES

**Missing:**
- No `.env` files
- No `.env.example`
- No `import.meta.env` usage
- No configuration management

### Future Needs

```bash
# .env.example
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_GOOGLE_MAPS_API_KEY=...
VITE_ANALYTICS_ID=...
```

**Note:** Vite uses `VITE_` prefix for environment variables exposed to client.

---

## Backend Integration Roadmap

### Current State: NO BACKEND

**Missing:**
- No API client
- No data fetching layer
- No authentication service
- No error handling
- No loading states

### Required Backend Features

1. **Listings API:**
   ```
   GET /api/listings          # Fetch all listings
   GET /api/listings/:id      # Fetch single listing
   POST /api/listings/search  # Search with filters
   ```

2. **User Authentication:**
   ```
   POST /api/auth/register    # User registration
   POST /api/auth/login       # User login
   GET /api/auth/me           # Get current user
   ```

3. **Bookings:**
   ```
   POST /api/bookings         # Create booking
   GET /api/bookings          # User's bookings
   ```

### Recommended API Client Setup

```jsx
// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  listings: {
    getAll: () => fetch(`${API_BASE_URL}/api/listings`).then(r => r.json()),
    getById: (id) => fetch(`${API_BASE_URL}/api/listings/${id}`).then(r => r.json()),
  },
  // ... more endpoints
};
```

---

## Routing & Navigation

### Current State: SINGLE PAGE

**No routing library installed** - entire app is one component.

### Future Multi-Page Setup

```bash
# Install React Router
npm install react-router-dom

# Recommended route structure
/                  # Home/Landing page
/listings          # Browse all listings
/listings/:id      # Listing details
/search            # Search results
/checkout          # Booking checkout
/account           # User profile
/login             # Login page
/signup            # Registration page
```

### Example Router Setup

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<ListingDetails />} />
        {/* ... more routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Deployment & Production

### Build Process

```bash
npm run build

# Output: dist/ directory
dist/
├── index.html
├── assets/
│   ├── main-[hash].js      # Bundled & minified JS
│   └── main-[hash].css     # Extracted & minified CSS
```

### Deployment Targets

**Compatible with:**
- Vercel (recommended for Vite projects)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Deployment Configuration

**Vercel (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Netlify (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

### Production Checklist

- [ ] Environment variables configured
- [ ] API endpoints point to production
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] SEO meta tags
- [ ] Open Graph tags for social sharing
- [ ] Performance monitoring
- [ ] Security headers
- [ ] HTTPS enabled

---

## Key AI Assistant Guidelines

### When Making Changes

1. **Always read files first** before editing
   - Use `Read` tool before `Edit` or `Write`
   - Understand context before modifications

2. **Respect file naming conventions**
   - Use exact paths: `src_App.jsx`, `src:main.jsx.txt`, `src_index.css`
   - Do NOT attempt to reorganize without approval

3. **Follow inline styling pattern**
   - Continue using inline styles unless user requests Tailwind migration
   - Maintain consistency with existing patterns

4. **Preserve brand colors**
   - Always use `#FF6B35` for primary orange
   - Follow established color palette
   - Maintain gradient patterns

5. **Test changes**
   - Run `npm run dev` after modifications
   - Verify no console errors
   - Check responsive behavior

### When Adding Features

1. **Maintain monolithic structure** (for now)
   - Add new sections to App.jsx
   - Don't create new component files without approval

2. **Keep data hardcoded** (until backend exists)
   - Use array mapping for lists
   - Follow existing patterns

3. **Use Lucide icons**
   - Import from `lucide-react`
   - Consistent with existing Truck icon usage

4. **Maintain responsive design**
   - Use CSS Grid with `auto-fit`
   - Test mobile (320px+) and desktop (1200px+)

### When Refactoring

1. **Get user approval first**
   - Major architectural changes require confirmation
   - Examples: Tailwind migration, component extraction, adding routing

2. **Preserve functionality**
   - Ensure visual output remains identical
   - Maintain all existing features

3. **Commit logical chunks**
   - One feature/fix per commit
   - Clear commit messages

### Common Tasks

#### Adding a New Section

```jsx
// Add to App.jsx after existing sections
<section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
  <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>
    New Section Title
  </h2>
  {/* Section content */}
</section>
```

#### Adding a New Icon

```jsx
// Import at top of App.jsx
import { Search, Truck, MapPin, Calendar } from 'lucide-react';

// Use inline
<MapPin style={{ width: '20px', height: '20px', color: '#FF6B35' }} />
```

#### Updating Brand Colors

```jsx
// Search for #FF6B35 and replace consistently
// Update tailwind.config.js if using Tailwind classes
```

---

## Performance Considerations

### Current Performance Profile

**Strengths:**
- Minimal dependencies (small bundle size)
- Vite's optimized build process
- No unnecessary re-renders (no state)
- Inline styles (no CSS-in-JS runtime)

**Optimization Opportunities:**
- Add lazy loading for images (when real images added)
- Implement code splitting (when multi-route)
- Optimize icon imports (import specific icons)
- Add image optimization (next/image, vite-imagetools)

### Bundle Size

**Estimated Production Bundle:**
- React + ReactDOM: ~130 KB gzipped
- Lucide icons: ~5 KB (only imported icons)
- Application code: ~2 KB
- **Total:** ~137 KB gzipped

---

## Security Considerations

### Current Security Status

**No security measures implemented:**
- No authentication
- No authorization
- No input validation
- No XSS protection (React handles by default)
- No CSRF protection
- No rate limiting

### Future Security Needs

1. **Authentication:** JWT or session-based
2. **Input Validation:** Form validation, sanitization
3. **API Security:** CORS, API keys, rate limiting
4. **HTTPS:** Enforce in production
5. **Environment Variables:** Never commit secrets
6. **Dependencies:** Regular security audits (`npm audit`)

---

## Accessibility (a11y)

### Current Status: MINIMAL

**Missing:**
- No ARIA labels
- No semantic HTML (uses generic divs)
- No keyboard navigation support
- No screen reader optimization
- No focus management
- No alt text (no images yet)

### Improvements Needed

```jsx
// Add semantic HTML
<header> instead of <div>
<nav> for navigation
<main> for main content
<article> for listing cards

// Add ARIA labels
<button aria-label="Sign up for Vendibook">Sign Up</button>

// Add keyboard support
onKeyDown handlers for interactive elements
```

---

## Development Tools & IDE Setup

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

### EditorConfig

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
```

---

## Troubleshooting Common Issues

### Build Errors

**Issue:** `Cannot find module './App.jsx'`
- **Cause:** Incorrect file path
- **Solution:** Use `src_App.jsx` not `src/App.jsx`

**Issue:** `Unexpected token '<'`
- **Cause:** JSX not being transformed
- **Solution:** Ensure `@vitejs/plugin-react` is installed and configured

### Runtime Errors

**Issue:** "Cannot read property 'map' of undefined"
- **Cause:** API data not loaded
- **Solution:** Add null checks, loading states

**Issue:** Styles not applying
- **Cause:** Tailwind not processing (current state)
- **Solution:** Use inline styles (current pattern) or fix Tailwind setup

### Development Server Issues

**Issue:** Port 5173 already in use
- **Solution:** Kill existing process or use different port in vite.config.js

```js
export default defineConfig({
  server: { port: 3000 }
})
```

---

## Future Roadmap & Recommendations

### Phase 1: Component Architecture (Current → Better Structure)

- [ ] Extract Header component from App.jsx
- [ ] Extract ListingCard component
- [ ] Extract Hero section
- [ ] Create components/ directory (properly nested)
- [ ] Add PropTypes or migrate to TypeScript

### Phase 2: Functionality

- [ ] Add React Router for multi-page navigation
- [ ] Implement search/filter functionality
- [ ] Add backend API integration
- [ ] Implement user authentication
- [ ] Add booking flow

### Phase 3: Quality & Testing

- [ ] Set up Vitest + React Testing Library
- [ ] Add ESLint + Prettier
- [ ] Implement error boundaries
- [ ] Add loading states
- [ ] Improve accessibility (WCAG 2.1 AA)

### Phase 4: Production Ready

- [ ] Environment configuration
- [ ] Error tracking (Sentry)
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] CI/CD pipeline (GitHub Actions)

---

## Quick Reference

### File Paths (Important!)

```
/home/user/vendibook/src/src_App.jsx          # Main component
/home/user/vendibook/src/src:main.jsx.txt     # Entry point
/home/user/vendibook/src/src_index.css        # Global CSS
/home/user/vendibook/index.html                # HTML template
/home/user/vendibook/package.json              # Dependencies
```

### Key Commands

```bash
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview build
npm install                    # Install dependencies
git status                     # Check git status
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push -u origin <branch>    # Push to remote
```

### Color Reference

```css
--brand-orange: #FF6B35;
--orange-gradient: #FF8C42;
--gold-accent: #FFD700;
--dark-gray: #1f2937;
--border-gray: #e5e7eb;
--text-gray: #6b7280;
--bg-gray: #f3f4f6;
```

### Import Patterns

```jsx
// React imports
import { useState, useEffect } from 'react';

// Lucide icons
import { Truck, Search, MapPin, Calendar } from 'lucide-react';

// Local components (when created)
import Header from './components/Header';
```

---

## Contact & Resources

**Project Owner:** Sharbi4 (shawnnaharbin@vendibook.com)
**Repository:** Vendibook - Mobile Business Rental Platform
**Documentation:** This file (CLAUDE.md)

**External Resources:**
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-19 | 1.0.0 | Initial CLAUDE.md creation - comprehensive codebase documentation |

---

**Last Updated:** November 19, 2025
**Document Version:** 1.0.0
**AI Assistant:** Claude (Sonnet 4.5)
