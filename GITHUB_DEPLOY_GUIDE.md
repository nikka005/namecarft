# Name Craft - GitHub Deployment Guide

## STEP 1: Push Code to GitHub (From This Server)

### 1.1 Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository named `namecraft` (or your preferred name)
3. Keep it **Private** if you want
4. Don't initialize with README

### 1.2 Push Code to GitHub
Run these commands on the Emergent server:

```bash
cd /app

# Initialize git (if not already)
git init

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/namecraft.git

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
venv/
__pycache__/
*.pyc

# Environment files (will create on server)
.env

# Build outputs
frontend/build/

# Logs
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF

# Add all files
git add .
git commit -m "Initial commit - Name Craft E-commerce"

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## STEP 2: AWS EC2 Setup

### 2.1 Launch EC2 Instance
- **AMI**: Ubuntu 22.04 LTS
- **Type**: t2.medium (or t2.small for testing)
- **Storage**: 30GB
- **Security Group Ports**: 22, 80, 443, 3000, 8001

### 2.2 Connect to EC2
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 2.3 Run Setup Script
```bash
# Download and run setup script
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/namecraft/main/aws_scripts/setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

Or manually:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## STEP 3: Clone & Deploy from GitHub

### 3.1 Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/namecraft.git
sudo chown -R ubuntu:ubuntu namecraft
cd namecraft
```

### 3.2 Setup Backend
```bash
cd /var/www/namecraft/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=namecraft_production
JWT_SECRET=change-this-to-random-secret-key-12345
EOF

deactivate
```

### 3.3 Setup Frontend (Replace YOUR_EC2_IP)
```bash
cd /var/www/namecraft/frontend

# Create .env with your EC2 IP
echo "REACT_APP_BACKEND_URL=http://YOUR_EC2_IP" > .env

# Install and build
yarn install
yarn build
```

### 3.4 Create Backend Service
```bash
sudo tee /etc/systemd/system/namecraft-backend.service << 'EOF'
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
```

### 3.5 Configure Nginx
```bash
sudo tee /etc/nginx/sites-available/namecraft << 'EOF'
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
EOF

sudo ln -sf /etc/nginx/sites-available/namecraft /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## STEP 4: Import Database from Emergent Server

### 4.1 On Emergent Server - Export Database
The database is already exported at `/app/db_export/`

### 4.2 Download Database Files
From your local machine:
```bash
# First download from Emergent (use the download feature in Emergent UI)
# Or use the API to get the files

# Then upload to AWS
scp -i your-key.pem db_export/*.json ubuntu@YOUR_EC2_IP:/tmp/
```

### 4.3 On AWS - Import Database
```bash
cd /tmp

# Import all collections
mongoimport --db=namecraft_production --collection=products --file=products.json
mongoimport --db=namecraft_production --collection=users --file=users.json
mongoimport --db=namecraft_production --collection=orders --file=orders.json
mongoimport --db=namecraft_production --collection=settings --file=settings.json
mongoimport --db=namecraft_production --collection=categories --file=categories.json
mongoimport --db=namecraft_production --collection=coupons --file=coupons.json
mongoimport --db=namecraft_production --collection=navigation --file=navigation.json
mongoimport --db=namecraft_production --collection=reviews --file=reviews.json

# Verify
mongosh namecraft_production --eval "db.products.countDocuments()"

# Restart backend
sudo systemctl restart namecraft-backend
```

---

## STEP 5: Test with IP Address

Open browser: `http://YOUR_EC2_IP`

### Test Checklist:
- [ ] Homepage loads
- [ ] Products display
- [ ] Add to cart works
- [ ] Checkout page loads
- [ ] Admin panel works (`/admin`)
- [ ] Login works (admin@test.com / admin123)

---

## STEP 6: After Testing - Setup Domain & SSL

### 6.1 Point Domain to EC2
In your domain registrar (GoDaddy, Namecheap, etc.):
- Add **A Record**: `@` → `YOUR_EC2_IP`
- Add **A Record**: `www` → `YOUR_EC2_IP`

Wait 5-10 minutes for DNS propagation.

### 6.2 Update Nginx for Domain
```bash
sudo nano /etc/nginx/sites-available/namecraft

# Change server_name to:
server_name yourdomain.com www.yourdomain.com;
```

### 6.3 Install SSL Certificate
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 6.4 Update Frontend for HTTPS
```bash
cd /var/www/namecraft/frontend
echo "REACT_APP_BACKEND_URL=https://yourdomain.com" > .env
yarn build
sudo systemctl reload nginx
```

---

## Quick Reference Commands

```bash
# View backend logs
sudo journalctl -u namecraft-backend -f

# Restart backend
sudo systemctl restart namecraft-backend

# Restart Nginx
sudo systemctl restart nginx

# Check MongoDB
sudo systemctl status mongod

# Update code from GitHub
cd /var/www/namecraft
git pull origin main
cd frontend && yarn build
sudo systemctl restart namecraft-backend
```

---

## Troubleshooting

### Backend not starting
```bash
sudo journalctl -u namecraft-backend -n 50
```

### 502 Bad Gateway
```bash
# Check if backend is running
curl http://localhost:8001/health

# Restart everything
sudo systemctl restart namecraft-backend
sudo systemctl restart nginx
```

### Database connection error
```bash
sudo systemctl status mongod
sudo systemctl restart mongod
```
