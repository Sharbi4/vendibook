#!/bin/bash

# Vendibook Three-Tab Homepage Activator
# Quick script to switch to the new three-tab homepage

echo "🎨 Activating Three-Tab Homepage..."
echo ""

# Backup current App.jsx if needed
if [ ! -f "src/App.jsx.backup" ]; then
    cp src/App.jsx src/App.jsx.backup
    echo "✅ Backed up original App.jsx"
fi

# Update import in App.jsx
sed -i.tmp "s|import HomePage from './pages/HomePage'|import HomePage from './pages/HomePageThreeTabs'|g" src/App.jsx
sed -i.tmp "s|import HomePage from './pages/HomePageEnhanced'|import HomePage from './pages/HomePageThreeTabs'|g" src/App.jsx
rm -f src/App.jsx.tmp

echo "✅ Three-Tab Homepage is now active!"
echo ""
echo "📋 Features Activated:"
echo "   ✨ Tab 1: RENT (Orange) - Booking flow"
echo "   ✨ Tab 2: FOR SALE (Green) - Purchase flow"
echo "   ✨ Tab 3: EVENT PRO (Dark/Gold) - Service booking"
echo "   ✨ 50 sparkle particles (6px, enhanced glow)"
echo "   ✨ Neutral inputs for Event Pro"
echo "   ✨ Tab-specific filters"
echo "   ✨ Mobile responsive"
echo ""
echo "🚀 Run 'npm run dev' to see the changes"
echo ""
echo "📖 See THREE_TAB_GUIDE.md for full documentation"
