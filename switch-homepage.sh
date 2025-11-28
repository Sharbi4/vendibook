#!/bin/bash

# Vendibook Homepage Switcher
# Usage: ./switch-homepage.sh [enhanced|original]

if [ "$1" = "enhanced" ]; then
    echo "🎨 Switching to Enhanced Homepage with Event Pro features..."
    
    # Backup current App.jsx if needed
    if [ ! -f "src/App.jsx.backup" ]; then
        cp src/App.jsx src/App.jsx.backup
        echo "✅ Backed up original App.jsx to App.jsx.backup"
    fi
    
    # Update import in App.jsx
    sed -i.tmp "s|import HomePage from './pages/HomePage'|import HomePage from './pages/HomePageEnhanced'|g" src/App.jsx
    rm -f src/App.jsx.tmp
    
    echo "✅ Enhanced homepage is now active!"
    echo "   - Tabbed search (Rent/Event Pro)"
    echo "   - Sparkle animations"
    echo "   - Event Pro filters"
    echo "   - Trust section"
    echo "   - Enhanced footer"
    echo ""
    echo "🚀 Run 'npm run dev' to see the changes"
    
elif [ "$1" = "original" ]; then
    echo "🔄 Switching back to Original Homepage..."
    
    # Restore original import
    sed -i.tmp "s|import HomePage from './pages/HomePageEnhanced'|import HomePage from './pages/HomePage'|g" src/App.jsx
    rm -f src/App.jsx.tmp
    
    echo "✅ Original homepage is now active!"
    echo "🚀 Run 'npm run dev' to see the changes"
    
else
    echo "❌ Invalid option. Usage:"
    echo "   ./switch-homepage.sh enhanced   - Use the new enhanced homepage"
    echo "   ./switch-homepage.sh original   - Use the original homepage"
    exit 1
fi
