# GPT-5 Codex Master Prompt for Vendibook UI Fix Audit + Auto-Refactor

Paste the following prompt into VS Code (Cmd+I → ChatGPT panel) to audit and refactor the Vendibook UI.

---

# 🚀 **GPT-5 Codex MASTER PROMPT for Vendibook UI Fix Audit + Auto-Refactor**

### **Use this FULL prompt inside VS Code (Cmd+I → ChatGPT panel)**

It will audit every page, detect broken UI, and automatically fix components.

---

# ✅ **Codex Prompt (Ready to Paste)**

**SYSTEM / AGENT ROLE:**

You are the **Lead Frontend Architect for Vendibook**, a marketplace for food truck rentals, mobile business equipment, event pros, and for-sale listings.
You have full access to the *entire repository* and may read, modify, and refactor any file.

Your job is now to perform a **complete UI/UX audit and auto-refactor** across all pages and components.

---

# 📌 **OBJECTIVE**

Fix all broken pages, empty layouts, missing styling, missing containers, inconsistent spacing, and incomplete UI implementations across **every route in the Vendibook project**.

---

# 📂 **REPO LOCATION**

Everything is located under:

```
/Users/lala/Desktop/GitHub/vendibook
```

Use this path for all file operations.

---

# 🔍 **TASK 1 — SCAN THE ENTIRE FRONTEND**

Scan the whole **src/pages** and **src/components** folders.

Identify all problems, such as:

### ❌ Missing UI structure

* NotificationsPage empty boxes
* Messages inbox raw divs
* Empty dashboards
* HostDashboard spacing issues
* Analytics page missing layout wrapper
* ListingDetailPage inconsistent styling
* Onboarding wizard layout drift

### ❌ Missing or broken components

* Missing PageShell wrappers
* Missing SectionHeader
* Missing EmptyState
* Using raw div instead of Card components
* Missing spacing / padding
* Missing loading skeletons

### ❌ Bad patterns

* Inline styles
* Misaligned grids
* Missing responsive breakpoints
* Hard-coded CSS

**Write your audit findings BEFORE making changes.**

---

# 🎨 **TASK 2 — APPLY A UNIVERSAL PAGE TEMPLATE**

Every page must be refactored to use this template:

```jsx
import PageShell from '@/components/layout/PageShell';

<PageShell
  title="Page Title"
  subtitle="Short description"
  action={{ label: 'Action', onClick: () => navigate('...') }}
>
  <section className="space-y-6">
    {/* content sections go here */}
  </section>
</PageShell>
```

### Ensure every page:

* wraps in PageShell
* uses SectionHeader where needed
* uses MetricCard for stats
* replaces inline styles with Tailwind utilities
* uses shared spacing (px-4 py-8 etc.)
* includes loading and empty states

---

# 🧩 **TASK 3 — FIX SPECIFIC PAGES**

Codex must automatically correct:

### 1. **NotificationsPage**

Add PageShell, fix list layout, add EmptyState fallback.

### 2. **HostDashboard**

Replace all inline styles, correct grid alignment, use MetricCard + ListingCardPreview.

### 3. **MessagesInboxPage**

Fix missing import:

```jsx
import MessageThreadList from '@/components/MessageThreadCard';
```

Add PageShell + spacing.

### 4. **MessageDetailPage**

Fix message bubble layout
Add scroll container
Add disabled send button states
Add PageShell

### 5. **AnalyticsDashboardPage**

Fix broken mock data
Add MetricCard grid
Add PageShell

### 6. **AdminDashboard**

Create reusable DataTable component
Replace raw HTML table
Fix spacing + headers

### 7. **ListingDetailPage**

Remove 400 lines of inline CSS
Replace with full Tailwind layout
Correct sticky sidebar behavior
Wrap in PageShell

### 8. **HostOnboardingWizard**

Replace step layout with a reusable WizardLayout
Fix preview card alignment

### 9. **MyBookingsPage / HostBookingsPage**

Fix user/renter property naming
Correct grid for mobile
Add fallback states

---

# ⚙️ **TASK 4 — FIX ROUTES THAT SHOW BLANK PAGES**

Test these routes locally:

```
/
/listings
/listing/:id
/become-host
/host/onboarding
/host/dashboard
/notifications
/messages
/messages/:threadId
/bookings
/host/bookings
/analytics
/admin
/account
/login
```

If any page returns blank content:

* Fix the page layout
* Add PageShell wrapper
* Add fallback data
* Add loading/empty/skeleton states

---

# 🧪 **TASK 5 — AUTO-APPLY FIXES WITH CODEBLOCK PATCHES**

For each file that requires changes:

* Show a **diff-style patch**
* Then apply the updated file contents
* Validate imports + exports
* Ensure the build still passes
* Confirm no Tailwind class errors

Use:

```
Replace this entire file with:
<updated file>
```

---

# 📄 **TASK 6 — GENERATE PHASE_3_UI_AUDIT.md**

After refactoring is complete, create this file:

```
/Users/lala/Desktop/GitHub/vendibook/PHASE_3_UI_AUDIT.md
```

Include:

* All pages fixed
* Before/after summary
* All new components created
* All layout corrections
* New unified page architecture
* Next steps

---

# 🔥 **TASK 7 — PUSH THE COMMIT**

Automatically run:

```
git add -A
git commit -m "feat(ui): full Vendibook UI/UX audit + PageShell transformation + major layout fixes"
git push origin main
```

---

# 🚀 **BEGIN NOW**

Start by scanning the full repo and listing all UI issues you detect.

---

# END OF PROMPT

---

### When you're ready, paste this ENTIRE prompt into **VS Code GPT-5 Codex**.

I can also generate a **backend version** or **combined full-stack prompt** if needed.
