#!/bin/bash

# Database Import Script - Uses files from db_export folder in repo
# Usage: ./import_db.sh

set -e

DB_NAME="namecraft_production"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPORT_DIR="$SCRIPT_DIR/../db_export"

echo "=========================================="
echo "  Importing Name Craft Database"
echo "=========================================="

# Check if mongodb-database-tools is installed
if ! command -v mongoimport &> /dev/null; then
    echo "Installing MongoDB Database Tools..."
    sudo apt install -y mongodb-database-tools
fi

# Check if export directory exists
if [ ! -d "$EXPORT_DIR" ]; then
    echo "Error: db_export directory not found at $EXPORT_DIR"
    exit 1
fi

cd "$EXPORT_DIR"

echo "Importing from: $EXPORT_DIR"
echo ""

# Import each collection
for file in *.json; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        collection="${file%.json}"
        echo "  Importing $collection..."
        mongoimport --db=$DB_NAME --collection=$collection --file=$file --drop 2>/dev/null || echo "    Warning: $collection import had issues"
    else
        echo "  Skipping $file (empty or not found)"
    fi
done

echo ""
echo "Database import complete!"
echo ""

# Show counts
echo "Collection counts:"
mongosh $DB_NAME --quiet --eval "
    print('  products: ' + db.products.countDocuments());
    print('  users: ' + db.users.countDocuments());
    print('  orders: ' + db.orders.countDocuments());
    print('  settings: ' + db.settings.countDocuments());
    print('  categories: ' + db.categories.countDocuments());
    print('  coupons: ' + db.coupons.countDocuments());
    print('  navigation: ' + db.navigation.countDocuments());
"

echo ""
echo "Restarting backend..."
sudo systemctl restart namecraft-backend

echo ""
echo "Done! Your website should now have all data."
echo "Visit: http://$(curl -s ifconfig.me)"
