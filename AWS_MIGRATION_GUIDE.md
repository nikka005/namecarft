# AWS Migration Guide for Name Craft (namecraft.shop)

## Overview
This guide covers migrating your e-commerce site from Emergent Platform to AWS with zero downtime.

---

## Architecture on AWS

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │  (DNS/Domain)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  CloudFront     │
                    │  (CDN/SSL)      │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐         ┌─────────▼─────────┐
     │   S3 Bucket     │         │   EC2 Instance    │
     │ (React Frontend)│         │ (FastAPI Backend) │
     └─────────────────┘         └─────────┬─────────┘
                                           │
                                  ┌────────▼────────┐
                                  │  MongoDB Atlas  │
                                  │   (Database)    │
                                  └─────────────────┘
```

---

## Step-by-Step Migration

### STEP 1: Export Code from Emergent
1. Click "Save to GitHub" in Emergent chat
2. Connect your GitHub account
3. Create a new repository (e.g., `namecraft-shop`)
4. Code will be pushed to your repo

---

### STEP 2: Set Up MongoDB Atlas (Database)

#### 2.1 Create MongoDB Atlas Account
```
1. Go to https://www.mongodb.com/atlas
2. Sign up for free account
3. Create a new cluster (M0 Free tier or M10+ for production)
4. Choose AWS as cloud provider
5. Select region closest to your users (Mumbai for India)
```

#### 2.2 Configure Database Access
```
1. Go to Database Access → Add New Database User
2. Create user: namecraft_admin
3. Generate strong password (save it!)
4. Set permissions: Read and write to any database
```

#### 2.3 Configure Network Access
```
1. Go to Network Access → Add IP Address
2. For testing: Allow access from anywhere (0.0.0.0/0)
3. For production: Add only your EC2 IP
```

#### 2.4 Get Connection String
```
1. Go to Clusters → Connect → Connect your application
2. Copy connection string:
   mongodb+srv://namecraft_admin:<password>@cluster0.xxxxx.mongodb.net/namecraft?retryWrites=true&w=majority
3. Replace <password> with your actual password
```

#### 2.5 Import Your Data
First, export from current database (run on Emergent or current server):
```bash
# Export from your current live database
mongodump --uri="YOUR_CURRENT_MONGO_URL" --db=YOUR_DB_NAME --out=/tmp/backup

# Import to MongoDB Atlas
mongorestore --uri="mongodb+srv://namecraft_admin:PASSWORD@cluster0.xxxxx.mongodb.net" --db=namecraft /tmp/backup/YOUR_DB_NAME
```

---

### STEP 3: Set Up AWS EC2 Instance (Backend)

#### 3.1 Launch EC2 Instance
```bash
# AWS Console → EC2 → Launch Instance
# Settings:
- Name: namecraft-backend
- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.small (2 vCPU, 2GB RAM) or t3.medium for better performance
- Key pair: Create new or use existing
- Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 8001 (API)
- Storage: 20 GB gp3
```

#### 3.2 Connect to EC2
```bash
# Download your .pem key file
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

#### 3.3 Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

#### 3.4 Clone Your Repository
```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/namecraft-shop.git
cd namecraft-shop
```

#### 3.5 Set Up Backend
```bash
cd /home/ubuntu/namecraft-shop/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
MONGO_URL="mongodb+srv://namecraft_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/namecraft?retryWrites=true&w=majority"
DB_NAME="namecraft"
JWT_SECRET="your-super-secret-jwt-key-change-this"
EOF

# Start backend with PM2
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name namecraft-backend
pm2 save
pm2 startup
```

#### 3.6 Set Up Frontend Build
```bash
cd /home/ubuntu/namecraft-shop/frontend

# Create .env file
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://namecraft.shop
EOF

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# Copy build to Nginx directory
sudo cp -r build/* /var/www/html/
```

#### 3.7 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/namecraft
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name namecraft.shop www.namecraft.shop;
    
    # Frontend (React)
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
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/namecraft /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

### STEP 4: Set Up SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (make sure domain points to your EC2 first)
sudo certbot --nginx -d namecraft.shop -d www.namecraft.shop

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

### STEP 5: Point Domain to AWS

#### Option A: If using Route 53
```
1. AWS Console → Route 53 → Hosted Zones
2. Create hosted zone for namecraft.shop
3. Add A record pointing to your EC2 Elastic IP
4. Update nameservers at your domain registrar
```

#### Option B: If using external DNS (GoDaddy, Namecheap, etc.)
```
1. Log in to your domain registrar
2. Go to DNS settings
3. Update A record:
   - Type: A
   - Name: @ (or namecraft.shop)
   - Value: YOUR_EC2_ELASTIC_IP
   - TTL: 300 (5 minutes)
4. Add www subdomain:
   - Type: CNAME
   - Name: www
   - Value: namecraft.shop
```

---

### STEP 6: Zero-Downtime Migration Strategy

```
Timeline:
1. Day 1: Set up AWS infrastructure (don't point domain yet)
2. Day 2: Test everything on AWS using EC2 IP
3. Day 3: Export latest data from Emergent, import to Atlas
4. Day 3: Lower DNS TTL to 300 seconds
5. Day 4: Wait 24 hours for TTL to propagate
6. Day 5: Final data sync + point domain to AWS
7. Day 5: Monitor and verify
```

#### Final Data Sync Script
```bash
# Run this just before switching DNS
# Export from Emergent (or current server)
mongodump --uri="CURRENT_MONGO_URL" --db=YOUR_DB_NAME --out=/tmp/final_backup

# Import to Atlas
mongorestore --uri="ATLAS_URL" --db=namecraft --drop /tmp/final_backup/YOUR_DB_NAME
```

---

### STEP 7: Post-Migration Checklist

- [ ] All pages load correctly
- [ ] User login/registration works
- [ ] Product pages display correctly
- [ ] Add to cart works
- [ ] Checkout and payment works
- [ ] Admin panel accessible
- [ ] Orders appear in admin
- [ ] Email notifications working
- [ ] SSL certificate active (https://)
- [ ] Mobile responsive

---

## Quick Command Reference

### On AWS EC2:
```bash
# View backend logs
pm2 logs namecraft-backend

# Restart backend
pm2 restart namecraft-backend

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Rebuild frontend
cd /home/ubuntu/namecraft-shop/frontend
npm run build
sudo cp -r build/* /var/www/html/

# Update code from GitHub
cd /home/ubuntu/namecraft-shop
git pull origin main
```

### Useful PM2 Commands:
```bash
pm2 status          # Check status
pm2 restart all     # Restart all
pm2 logs            # View logs
pm2 monit           # Monitor CPU/Memory
```

---

## Estimated AWS Costs (Monthly)

| Service | Specification | Cost |
|---------|---------------|------|
| EC2 t3.small | 2 vCPU, 2GB RAM | ~$15/month |
| MongoDB Atlas M10 | 2GB RAM | ~$57/month |
| Route 53 | DNS hosting | ~$0.50/month |
| Data Transfer | ~10GB | ~$1/month |
| **Total** | | **~$75/month** |

**Free Tier Options:**
- EC2 t2.micro (750 hours free for 12 months)
- MongoDB Atlas M0 (free forever, 512MB)

---

## Support Contacts

- AWS Support: https://aws.amazon.com/support/
- MongoDB Atlas: https://www.mongodb.com/support
- Your domain registrar's support

---

## Alternative: Use AWS Lightsail (Simpler)

If AWS EC2 seems complex, try AWS Lightsail:
```
1. Go to https://lightsail.aws.amazon.com
2. Create instance → Linux → Ubuntu 22.04
3. Choose $10/month plan (2GB RAM)
4. Follow same setup steps as EC2
5. Attach static IP
6. Point domain
```

Lightsail is simpler and includes:
- Fixed monthly pricing
- Static IP included
- Simpler firewall management
