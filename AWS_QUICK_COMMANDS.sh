#!/bin/bash
# AWS Migration Quick Commands for Name Craft
# Run these commands on your new AWS EC2 instance

# ===========================================
# STEP 1: INITIAL SERVER SETUP
# ===========================================

# Update system
sudo apt update && sudo apt upgrade -y

# Install all required packages
sudo apt install -y python3.11 python3.11-venv python3-pip nginx git certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# ===========================================
# STEP 2: CLONE AND SETUP PROJECT
# ===========================================

# Clone repository (replace with your repo)
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/namecraft-shop.git
cd namecraft-shop

# ===========================================
# STEP 3: SETUP BACKEND
# ===========================================

cd /home/ubuntu/namecraft-shop/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create backend .env file (EDIT THESE VALUES!)
cat > .env << 'ENVFILE'
MONGO_URL="mongodb+srv://USERNAME:PASSWORD@cluster.xxxxx.mongodb.net/namecraft?retryWrites=true&w=majority"
DB_NAME="namecraft"
JWT_SECRET="change-this-to-a-random-64-character-string"
ENVFILE

# Start backend with PM2
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name backend
pm2 save
pm2 startup

# ===========================================
# STEP 4: SETUP FRONTEND
# ===========================================

cd /home/ubuntu/namecraft-shop/frontend

# Create frontend .env file (EDIT THIS!)
cat > .env << 'ENVFILE'
REACT_APP_BACKEND_URL=https://namecraft.shop
ENVFILE

# Install and build
npm install --legacy-peer-deps
npm run build

# Copy to web root
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/

# ===========================================
# STEP 5: CONFIGURE NGINX
# ===========================================

# Create Nginx config
sudo tee /etc/nginx/sites-available/namecraft << 'NGINXCONF'
server {
    listen 80;
    server_name namecraft.shop www.namecraft.shop;
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
NGINXCONF

# Enable site
sudo ln -sf /etc/nginx/sites-available/namecraft /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# ===========================================
# STEP 6: SSL CERTIFICATE
# ===========================================

# Get SSL certificate (run after DNS is pointed to your server)
sudo certbot --nginx -d namecraft.shop -d www.namecraft.shop --non-interactive --agree-tos -m your-email@example.com

# ===========================================
# STEP 7: MONGODB DATA MIGRATION
# ===========================================

# Install MongoDB tools
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-database-tools

# Import data to MongoDB Atlas (run from local machine with your backup)
# mongorestore --uri="mongodb+srv://USER:PASS@cluster.mongodb.net" --db=namecraft ./backup/

# ===========================================
# USEFUL MANAGEMENT COMMANDS
# ===========================================

# View backend logs
pm2 logs backend

# Restart backend
pm2 restart backend

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check backend status
pm2 status

# Update code from GitHub
cd /home/ubuntu/namecraft-shop
git pull origin main
pm2 restart backend
cd frontend && npm run build && sudo cp -r build/* /var/www/html/

# Check disk space
df -h

# Check memory usage
free -m

# Check running processes
htop
