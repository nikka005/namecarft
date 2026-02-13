#!/bin/bash

# Name Craft AWS Setup Script
# Run this on a fresh Ubuntu 22.04 EC2 instance
# Usage: chmod +x setup.sh && sudo ./setup.sh

set -e

echo "=========================================="
echo "  Name Craft - AWS Server Setup Script   "
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (sudo ./setup.sh)"
    exit 1
fi

echo -e "${YELLOW}Step 1: Updating system...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}Step 2: Installing essential tools...${NC}"
apt install -y curl wget git build-essential software-properties-common

echo -e "${YELLOW}Step 3: Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g yarn

echo -e "${YELLOW}Step 4: Installing Python 3...${NC}"
apt install -y python3 python3-pip python3-venv

echo -e "${YELLOW}Step 5: Installing MongoDB 6.0...${NC}"
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

echo -e "${YELLOW}Step 6: Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo -e "${YELLOW}Step 7: Creating application directory...${NC}"
mkdir -p /var/www/namecraft
chown -R ubuntu:ubuntu /var/www/namecraft

echo -e "${GREEN}=========================================="
echo "  Base setup complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Upload your code to /var/www/namecraft/"
echo "2. Run: cd /var/www/namecraft && ./deploy.sh"
echo ""
echo "Versions installed:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Python: $(python3 --version)"
echo "  MongoDB: $(mongod --version | head -1)"
echo ""
