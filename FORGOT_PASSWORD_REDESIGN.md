# Forgot Password Page Redesign - Documentation

## Overview

This document details the redesign of the Forgot Password page and the new reusable header/sidebar system implemented across Vendibook.

## New Components

### 1. **Header Component** (`src/components/Header.jsx`)

A minimal, reusable header component that displays:
- **Left**: Vendibook logo (clickable, links to homepage)
- **Right**: Hamburger menu icon (3-bar button)

#### Props:
- `onMenuOpen` (function, required): Callback when hamburger menu is clicked
- `variant` (string, optional): `'default'` (white background) or `'transparent'` (for overlay on images)

#### Usage:
```jsx
import Header from './components/Header';

<Header
  onMenuOpen={() => setMenuOpen(true)}
  variant="transparent"
/>
```

---

### 2. **SidebarMenu Component** (`src/components/SidebarMenu.jsx`)

A comprehensive navigation sidebar that:
- **Slides in from the right** (320-380px on desktop, 75% width on mobile)
- **Pushes content to the left** instead of overlaying it
- Shows **different links based on authentication state**
- Includes **keyboard accessibility** (ESC to close, focus trap)
- Has a **solid white background** with shadow

#### Props:
- `isOpen` (boolean, required): Controls sidebar visibility
- `onClose` (function, required): Callback to close the sidebar

#### Menu Structure:

**PUBLIC LINKS (always visible):**

**Explore Section:**
- Home
- Browse Listings
- Food Trucks
- Food Trailers
- Event Pros
- Ghost Kitchens
- Lots & Parking
- For Sale Marketplace

**Learn Section:**
- How It Works
- Renter Guide
- Host Guide
- Buying Guide
- Blog
- FAQ

**Company Section:**
- About
- Contact
- Trust & Safety
- Insurance (FLIP)
- Terms of Service
- Privacy Policy

**AUTH-BASED LINKS (conditional):**

**When NOT logged in:**
- Login
- Create Account
- Become a Host

**When logged in:**

**My Account:**
- Dashboard
- My Bookings
- My Listings
- Messages
- Saved Listings
- Profile Settings
- Payment Methods

**Host Actions:**
- Create Listing
- Payouts / Earnings

**Session:**
- Logout (red button with icon)

#### Features:
- **ESC key closes menu**
- **Click outside (overlay) closes menu**
- **Focus trap** keeps keyboard navigation inside sidebar
- **Smooth animations** (300ms slide transition)
- **Body scroll lock** when open
- **Conditional rendering** using Clerk's `<SignedIn>` and `<SignedOut>` components

#### Usage:
```jsx
import { useState } from 'react';
import SidebarMenu from './components/SidebarMenu';

function MyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <SidebarMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      {/* Page content */}
    </>
  );
}
```

---

### 3. **PageLayout Component** (`src/components/PageLayout.jsx`)

A reusable layout wrapper that combines Header + SidebarMenu with content-shift behavior.

#### Props:
- `children` (React.ReactNode, required): Page content
- `headerVariant` (string, optional): `'default'` or `'transparent'`
- `className` (string, optional): Additional CSS classes for wrapper
- `fullHeight` (boolean, optional): Whether to use full viewport height

#### Usage Examples:

**Basic page with default white header:**
```jsx
import PageLayout from './components/PageLayout';

function MyPage() {
  return (
    <PageLayout>
      <div className="p-8">
        <h1>My Page Content</h1>
        <p>This is my page content.</p>
      </div>
    </PageLayout>
  );
}
```

**Page with transparent header (over image):**
```jsx
import PageLayout from './components/PageLayout';

function HeroPage() {
  return (
    <PageLayout headerVariant="transparent" fullHeight>
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          <img
            src="/hero.jpg"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 p-8">
          <h1 className="text-white">Content over image</h1>
        </div>
      </div>
    </PageLayout>
  );
}
```

---

## Updated Forgot Password Page

### What Changed:

1. **New Header**: Replaced custom header with reusable `Header` component
   - Logo on left
   - Hamburger menu on right
   - Transparent variant to work over background image

2. **Sidebar Menu Integration**: Added full navigation sidebar
   - Accessible from hamburger button
   - Slides from right
   - Pushes content left (not overlay)
   - Smooth 300ms animation

3. **Content Shift Behavior**:
   - Main content wrapper shifts left by `-380px` on desktop when menu opens
   - Shifts by `-85vw` on mobile
   - Semi-transparent overlay appears over remaining content
   - Content is still visible (not completely hidden)

4. **Trust & Security Section**: Added below the reset card
   - **Heading**: "How Vendibook Keeps Your Account Secure"
   - **3 Security Features**:
     - Secure Password Reset (with Lock icon)
     - Identity Verification (with Shield icon)
     - Trust & Support (with Users icon)
   - **How It Works** (3 numbered steps):
     1. Enter email and request reset link
     2. Open email and click secure link
     3. Choose new password and sign in

### Visual Layout:

```
┌────────────────────────────────────────────────┐
│  [Logo]                          [☰ Menu]     │ ← Header (transparent)
├────────────────────────────────────────────────┤
│                                                │
│         [Forest Background Image]             │
│                                                │
│     ┌──────────────────────────────┐          │
│     │  Forgot Password Card        │          │ ← Reset Card
│     │  - Email input               │          │
│     │  - Send reset link button    │          │
│     │  - Back to sign in link      │          │
│     └──────────────────────────────┘          │
│                                                │
│     ┌──────────────────────────────┐          │
│     │ How Vendibook Keeps Your     │          │
│     │ Account Secure               │          │ ← Trust Section
│     │                              │          │
│     │ [Lock] Secure Password Reset │          │
│     │ [Shield] Identity Verify     │          │
│     │ [Users] Trust & Support      │          │
│     │                              │          │
│     │ --- How It Works ---         │          │
│     │ 1. Enter email               │          │
│     │ 2. Click link                │          │
│     │ 3. Choose new password       │          │
│     └──────────────────────────────┘          │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Technical Implementation Details

### Content Shift Animation

The content shift is achieved using negative right margin:

```jsx
<div
  className={`transition-all duration-300 ease-in-out ${
    menuOpen ? '-mr-[380px] max-[768px]:-mr-[85vw]' : 'mr-0'
  }`}
>
  {/* Page content */}
</div>
```

**How it works:**
- When `menuOpen` is `false`: `margin-right: 0` (normal position)
- When `menuOpen` is `true`: `margin-right: -380px` (shifts content left by 380px on desktop)
- On mobile: `margin-right: -85vw` (shifts content left by 85% of viewport width)
- Smooth transition over 300ms with ease-in-out easing

### Keyboard Accessibility

**ESC Key Handler:**
```javascript
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

**Focus Trap:**
```javascript
useEffect(() => {
  if (isOpen && sidebarRef.current) {
    const focusableElements = sidebarRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      // Trap focus within sidebar
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus(); // Auto-focus first element

    return () => document.removeEventListener('keydown', handleTab);
  }
}, [isOpen]);
```

**Body Scroll Lock:**
```javascript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);
```

---

## Conditional Rendering (Auth State)

The sidebar menu uses Clerk's authentication components to show different links based on login state:

```jsx
import { SignedIn, SignedOut } from '@clerk/clerk-react';

// Show these links only when NOT logged in
<SignedOut>
  <MenuLink onClick={() => handleNavigate('/signin')}>Login</MenuLink>
  <MenuLink onClick={() => handleNavigate('/signup')}>Create Account</MenuLink>
  <MenuLink onClick={() => handleNavigate('/become-a-host')}>Become a Host</MenuLink>
</SignedOut>

// Show these links only when logged in
<SignedIn>
  <MenuLink onClick={() => handleNavigate('/dashboard')}>Dashboard</MenuLink>
  <MenuLink onClick={() => handleNavigate('/dashboard/bookings')}>My Bookings</MenuLink>
  {/* More authenticated links */}
  <button onClick={handleSignOut}>Logout</button>
</SignedIn>
```

---

## Applying to Other Pages

To apply this header + sidebar pattern to other pages, you have two options:

### Option 1: Use PageLayout Component (Recommended)

```jsx
import PageLayout from '../components/PageLayout';

function MyPage() {
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1>My Page</h1>
        <p>Content goes here...</p>
      </div>
    </PageLayout>
  );
}
```

### Option 2: Manual Integration

```jsx
import { useState } from 'react';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';

function MyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <SidebarMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className={`transition-all duration-300 ${
        menuOpen ? '-mr-[380px] max-[768px]:-mr-[85vw]' : 'mr-0'
      }`}>
        <Header onMenuOpen={() => setMenuOpen(true)} variant="default" />

        <main>
          {/* Your page content */}
        </main>
      </div>
    </>
  );
}
```

---

## Styling & Design Tokens

### Colors (Coral Theme):
```css
.bg-coral-100 { background-color: #fff1f0; }
.bg-coral-500 { background-color: #ff6b6b; }
.text-coral-500 { color: #ff6b6b; }
```

### Transitions:
- Sidebar slide: `300ms ease-in-out`
- Content shift: `300ms ease-in-out`
- Button hover: default transitions

### Responsive Breakpoints:
- Desktop: Sidebar 380px wide
- Mobile: Sidebar 85vw wide
- Header hamburger: Always visible (no desktop-only nav)

---

## Testing Checklist

- [x] Header displays logo and hamburger button
- [x] Hamburger button opens sidebar
- [x] Sidebar slides from right smoothly
- [x] Page content shifts left (not overlaid)
- [x] Clicking overlay closes sidebar
- [x] Pressing ESC closes sidebar
- [x] Focus trapped within sidebar when open
- [x] Body scroll locked when sidebar open
- [x] Conditional links show based on auth state
- [x] Logout button works correctly
- [x] Trust & Security section displays below reset card
- [x] All 3 security features visible with icons
- [x] How It Works steps numbered correctly
- [x] Responsive on mobile and desktop

---

## Future Enhancements

1. **Animation improvements:**
   - Add slide-in animation for menu items (stagger effect)
   - Fade in overlay

2. **Mobile optimization:**
   - Swipe gesture to close sidebar
   - Pull-to-close on overlay

3. **Accessibility:**
   - Announce menu open/close to screen readers
   - Add aria-expanded to hamburger button

4. **Performance:**
   - Lazy load sidebar menu content
   - Debounce resize events

---

## Files Modified/Created

### Created:
- `src/components/Header.jsx` - Reusable header component
- `src/components/SidebarMenu.jsx` - Navigation sidebar with auth-based links
- `src/components/PageLayout.jsx` - Layout wrapper combining header + sidebar
- `FORGOT_PASSWORD_REDESIGN.md` - This documentation

### Modified:
- `src/pages/ForgotPasswordPage.jsx` - Redesigned with new header, sidebar, and trust section

---

## Summary

This redesign implements a modern, accessible navigation system with:
- ✅ Consistent header across all pages
- ✅ Comprehensive sidebar menu (20+ links)
- ✅ Content-shift behavior (not overlay)
- ✅ Auth-based conditional rendering
- ✅ Full keyboard accessibility
- ✅ Trust & security information
- ✅ Smooth animations
- ✅ Mobile responsive

The pattern can be easily applied to any page using the `PageLayout` component or by manually integrating `Header` + `SidebarMenu`.
