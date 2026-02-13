#!/bin/bash

# Database Import Script
# Run this after deploying the application
# Usage: ./import_db.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DB_NAME="namecraft_production"
IMPORT_DIR="/tmp/db_import"

echo "=========================================="
echo "  Importing Name Craft Database"
echo "=========================================="

if [ ! -d "$IMPORT_DIR" ]; then
    echo "Error: Import directory not found at $IMPORT_DIR"
    echo "Please upload your database JSON files first:"
    echo "  scp -i your-key.pem *.json ubuntu@YOUR_IP:/tmp/db_import/"
    exit 1
fi

cd $IMPORT_DIR

echo -e "${YELLOW}Importing collections...${NC}"

# Import each collection
for file in *.json; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        collection="${file%.json}"
        echo "  Importing $collection..."
        mongoimport --db=$DB_NAME --collection=$collection --file=$file --drop 2>/dev/null || true
    fi
done

echo ""
echo -e "${GREEN}Import complete!${NC}"
echo ""
echo "Database statistics:"
mongosh $DB_NAME --quiet --eval "
    print('  Products: ' + db.products.countDocuments());
    print('  Users: ' + db.users.countDocuments());
    print('  Orders: ' + db.orders.countDocuments());
    print('  Settings: ' + db.settings.countDocuments());
    print('  Categories: ' + db.categories.countDocuments());
"

echo ""
echo "Restarting backend service..."
sudo systemctl restart namecraft-backend
echo -e "${GREEN}Done!${NC}"
