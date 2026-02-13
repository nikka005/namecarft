#!/bin/bash

# Quick Deploy Script - Run after cloning from GitHub
# Usage: ./quick_deploy.sh YOUR_EC2_IP

set -e

if [ -z "$1" ]; then
    echo "Usage: ./quick_deploy.sh YOUR_EC2_IP"
    echo "Example: ./quick_deploy.sh 54.123.45.67"
    exit 1
fi

IP=$1
echo "Deploying Name Craft to IP: $IP"

# Backend
echo "Setting up backend..."
cd /var/www/namecraft/backend
python3 -m venv venv
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=namecraft_production
JWT_SECRET=$(openssl rand -hex 32)
EOF
deactivate

# Frontend
echo "Building frontend..."
cd /var/www/namecraft/frontend
echo "REACT_APP_BACKEND_URL=http://$IP" > .env
yarn install --silent
yarn build

# Backend Service
echo "Creating backend service..."
sudo tee /etc/systemd/system/namecraft-backend.service > /dev/null << 'EOF'
[Unit]
Description=Name Craft Backend
After=network.target mongod.service

[Service]
User=ubuntu
WorkingDirectory=/var/www/namecraft/backend
Environment="PATH=/var/www/namecraft/backend/venv/bin"
ExecStart=/var/www/namecraft/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable namecraft-backend
sudo systemctl start namecraft-backend

# Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/namecraft > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/namecraft/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
    }

    location /health {
        proxy_pass http://127.0.0.1:8001;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/namecraft /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo "  Website: http://$IP"
echo "  Admin: http://$IP/admin"
echo "  Login: admin@test.com / admin123"
echo ""
echo "  Next: Import database with import_db.sh"
echo "=========================================="
