#!/bin/bash

# Name Craft Deployment Script
# Run this after uploading code to /var/www/namecraft
# Usage: chmod +x deploy.sh && ./deploy.sh YOUR_EC2_PUBLIC_IP

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get server IP
if [ -z "$1" ]; then
    echo -e "${RED}Usage: ./deploy.sh YOUR_EC2_PUBLIC_IP${NC}"
    echo "Example: ./deploy.sh 54.123.45.67"
    exit 1
fi

SERVER_IP=$1
APP_DIR="/var/www/namecraft"

echo "=========================================="
echo "  Deploying Name Craft Application"
echo "  Server IP: $SERVER_IP"
echo "=========================================="

# Backend Setup
echo -e "${YELLOW}Setting up Backend...${NC}"
cd $APP_DIR/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=namecraft_production
JWT_SECRET=$(openssl rand -hex 32)
EOF

deactivate
echo -e "${GREEN}Backend setup complete!${NC}"

# Frontend Setup
echo -e "${YELLOW}Setting up Frontend...${NC}"
cd $APP_DIR/frontend

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=http://$SERVER_IP
EOF

# Install dependencies and build
yarn install
yarn build
echo -e "${GREEN}Frontend build complete!${NC}"

# Create systemd service
echo -e "${YELLOW}Creating backend service...${NC}"
sudo cat > /etc/systemd/system/namecraft-backend.service << EOF
[Unit]
Description=Name Craft Backend API
After=network.target mongod.service

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/venv/bin"
ExecStart=$APP_DIR/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable namecraft-backend
sudo systemctl start namecraft-backend
echo -e "${GREEN}Backend service started!${NC}"

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
sudo cat > /etc/nginx/sites-available/namecraft << EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root $APP_DIR/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8001;
    }

    # File uploads
    location /api/uploads {
        proxy_pass http://127.0.0.1:8001;
        client_max_body_size 10M;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/namecraft /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
echo -e "${GREEN}Nginx configured!${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Your application is now running at:"
echo -e "${GREEN}  http://$SERVER_IP${NC}"
echo ""
echo "Admin Panel:"
echo -e "${GREEN}  http://$SERVER_IP/admin${NC}"
echo "  Login: admin@test.com / admin123"
echo ""
echo "Next steps:"
echo "  1. Import your database (see import_db.sh)"
echo "  2. Test the application"
echo "  3. Set up SSL with: sudo certbot --nginx"
echo ""
