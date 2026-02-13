# AWS Deployment Guide - Name Craft E-Commerce

## Overview
This guide will help you deploy the Name Craft application on AWS EC2 with:
- Ubuntu 22.04 LTS
- Node.js 18+ (Frontend)
- Python 3.10+ (Backend)
- MongoDB 6.0
- Nginx (Reverse Proxy)

---

## PHASE 1: AWS Setup

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose:
   - **Name**: `namecraft-server`
   - **AMI**: Ubuntu Server 22.04 LTS (64-bit)
   - **Instance Type**: `t2.medium` (2 vCPU, 4GB RAM) - minimum recommended
   - **Key Pair**: Create new or use existing `.pem` file
   - **Storage**: 30GB gp3

3. **Security Group** - Allow these ports:
   ```
   SSH (22)        - Your IP only
   HTTP (80)       - Anywhere (0.0.0.0/0)
   HTTPS (443)     - Anywhere (0.0.0.0/0)
   Custom (8001)   - Anywhere (for API testing)
   Custom (3000)   - Anywhere (for frontend testing)
   ```

4. Launch and note down your **Public IP Address**

---

## PHASE 2: Server Setup

### Step 2: Connect to Server

```bash
# From your local machine (replace with your .pem file and IP)
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3: Update System & Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential software-properties-common

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
sudo npm install -g yarn

# Install Python 3.10 and pip
sudo apt install -y python3 python3-pip python3-venv

# Verify installations
node --version    # Should show v18.x.x
npm --version     # Should show 9.x.x or 10.x.x
python3 --version # Should show Python 3.10.x
```

### Step 4: Install MongoDB 6.0

```bash
# Import MongoDB GPG key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### Step 5: Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## PHASE 3: Application Setup

### Step 6: Create Application Directory

```bash
# Create app directory
sudo mkdir -p /var/www/namecraft
sudo chown -R ubuntu:ubuntu /var/www/namecraft
cd /var/www/namecraft
```

### Step 7: Upload Code Files

**Option A: Using SCP (from your local machine)**
```bash
# From your local machine where you downloaded the code
scp -i your-key.pem -r ./backend ubuntu@YOUR_EC2_IP:/var/www/namecraft/
scp -i your-key.pem -r ./frontend ubuntu@YOUR_EC2_IP:/var/www/namecraft/
```

**Option B: Using Git (if you pushed to GitHub)**
```bash
cd /var/www/namecraft
git clone https://github.com/YOUR_USERNAME/namecraft.git .
```

### Step 8: Setup Backend

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
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EOF

# Test backend starts
python -m uvicorn server:app --host 0.0.0.0 --port 8001
# Press Ctrl+C to stop after verifying it works
```

### Step 9: Setup Frontend

```bash
cd /var/www/namecraft/frontend

# Install dependencies
yarn install

# Create .env file (replace YOUR_EC2_IP with your actual IP)
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://YOUR_EC2_PUBLIC_IP
EOF

# Build for production
yarn build
```

---

## PHASE 4: Configure Services

### Step 10: Create Backend Service (systemd)

```bash
sudo cat > /etc/systemd/system/namecraft-backend.service << 'EOF'
[Unit]
Description=Name Craft Backend API
After=network.target mongod.service

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/namecraft/backend
Environment="PATH=/var/www/namecraft/backend/venv/bin"
ExecStart=/var/www/namecraft/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start backend service
sudo systemctl daemon-reload
sudo systemctl enable namecraft-backend
sudo systemctl start namecraft-backend

# Check status
sudo systemctl status namecraft-backend
```

### Step 11: Configure Nginx

```bash
sudo cat > /etc/nginx/sites-available/namecraft << 'EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain later

    # Frontend (React build)
    location / {
        root /var/www/namecraft/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # File uploads
    location /api/uploads {
        proxy_pass http://127.0.0.1:8001;
        client_max_body_size 10M;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/namecraft /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## PHASE 5: Database Migration

### Step 12: Import Database

First, upload the database export files to the server:

```bash
# From your local machine
scp -i your-key.pem /app/db_export/*.json ubuntu@YOUR_EC2_IP:/tmp/db_import/
```

Then on the server:

```bash
# On the EC2 server
mkdir -p /tmp/db_import
cd /tmp/db_import

# Import each collection
mongoimport --db=namecraft_production --collection=products --file=products.json
mongoimport --db=namecraft_production --collection=users --file=users.json
mongoimport --db=namecraft_production --collection=orders --file=orders.json
mongoimport --db=namecraft_production --collection=settings --file=settings.json
mongoimport --db=namecraft_production --collection=categories --file=categories.json
mongoimport --db=namecraft_production --collection=coupons --file=coupons.json
mongoimport --db=namecraft_production --collection=navigation --file=navigation.json
mongoimport --db=namecraft_production --collection=reviews --file=reviews.json

# Verify import
mongosh namecraft_production --eval "db.products.countDocuments()"
mongosh namecraft_production --eval "db.users.countDocuments()"
```

---

## PHASE 6: Testing

### Step 13: Test the Application

```bash
# Test backend health
curl http://localhost:8001/health

# Test frontend (should return HTML)
curl http://localhost/

# Test API through Nginx
curl http://localhost/api/products
```

Now open your browser and go to: `http://YOUR_EC2_PUBLIC_IP`

---

## PHASE 7: Domain & SSL Setup (After testing with IP)

### Step 14: Point Domain to EC2

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add an A record:
   - **Type**: A
   - **Host**: @ (or www)
   - **Value**: YOUR_EC2_PUBLIC_IP
   - **TTL**: 300

### Step 15: Install SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically, but you can test it:
sudo certbot renew --dry-run
```

### Step 16: Update Frontend for HTTPS

```bash
cd /var/www/namecraft/frontend

# Update .env with HTTPS domain
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://yourdomain.com
EOF

# Rebuild frontend
yarn build

# Restart services
sudo systemctl restart namecraft-backend
sudo systemctl reload nginx
```

---

## Quick Commands Reference

```bash
# View backend logs
sudo journalctl -u namecraft-backend -f

# Restart backend
sudo systemctl restart namecraft-backend

# Restart Nginx
sudo systemctl restart nginx

# Check MongoDB status
sudo systemctl status mongod

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

## Troubleshooting

### Backend not starting
```bash
# Check logs
sudo journalctl -u namecraft-backend -n 50

# Test manually
cd /var/www/namecraft/backend
source venv/bin/activate
python -m uvicorn server:app --host 0.0.0.0 --port 8001
```

### MongoDB connection issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### Nginx 502 Bad Gateway
```bash
# Check if backend is running
curl http://localhost:8001/health

# Check Nginx config
sudo nginx -t

# Restart services
sudo systemctl restart namecraft-backend
sudo systemctl reload nginx
```

---

## Security Checklist

- [ ] Change JWT_SECRET in backend/.env
- [ ] Set up MongoDB authentication (optional but recommended)
- [ ] Enable UFW firewall
- [ ] Set up fail2ban for SSH protection
- [ ] Regular system updates: `sudo apt update && sudo apt upgrade`

---

## Estimated Costs (AWS)

| Resource | Monthly Cost |
|----------|-------------|
| EC2 t2.medium | ~$30-35 |
| EBS 30GB | ~$3 |
| Data Transfer | ~$5-10 |
| **Total** | **~$40-50/month** |

For lower costs, consider t2.small ($15/month) for low traffic sites.
