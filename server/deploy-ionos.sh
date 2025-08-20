#!/bin/bash

# CarersMind IONOS Deployment Script
# This script deploys your Node.js API to IONOS hosting

set -e  # Exit on any error

echo "🚀 Starting CarersMind API deployment to IONOS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="carersmind-api"
IONOS_USERNAME="your_ionos_username"
IONOS_HOST="your_ionos_server_ip"
REMOTE_DIR="/var/www/carersmind-api"
BACKUP_DIR="/var/www/backups"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "Project: $PROJECT_NAME"
echo "Host: $IONOS_HOST"
echo "Remote Directory: $REMOTE_DIR"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the server directory.${NC}"
    exit 1
fi

# Build the project
echo -e "${YELLOW}🔨 Building project...${NC}"
npm ci --only=production

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
DEPLOY_DIR="deploy-temp"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

# Copy necessary files
cp -r package*.json $DEPLOY_DIR/
cp -r routes $DEPLOY_DIR/
cp -r config $DEPLOY_DIR/
cp -r middleware $DEPLOY_DIR/
cp -r utils $DEPLOY_DIR/
cp server.js $DEPLOY_DIR/
cp .env $DEPLOY_DIR/

# Remove development files
rm -rf $DEPLOY_DIR/config/swagger.js
rm -rf $DEPLOY_DIR/node_modules

# Create production start script
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=5002
node server.js
EOF

chmod +x $DEPLOY_DIR/start.sh

# Create systemd service file
cat > $DEPLOY_DIR/carersmind-api.service << EOF
[Unit]
Description=CarersMind API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$REMOTE_DIR
Environment=NODE_ENV=production
Environment=PORT=5002
ExecStart=$REMOTE_DIR/start.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create nginx configuration
cat > $DEPLOY_DIR/nginx-carersmind-api.conf << 'EOF'
server {
    listen 80;
    server_name api.carersmind.co.uk;
    
    location / {
        proxy_pass http://127.0.0.1:5002;
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
EOF

# Create deployment instructions
cat > $DEPLOY_DIR/DEPLOYMENT-INSTRUCTIONS.md << 'EOF'
# IONOS Deployment Instructions

## 1. Upload Files
Upload all files in this directory to: /var/www/carersmind-api/

## 2. Install Dependencies
```bash
cd /var/www/carersmind-api/
npm ci --only=production
```

## 3. Set Environment Variables
Edit .env file with your production values:
- STRIPE_SECRET_KEY (LIVE key)
- SUPABASE credentials
- JWT_SECRET

## 4. Set Up Nginx
```bash
sudo cp nginx-carersmind-api.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/nginx-carersmind-api.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Set Up Systemd Service
```bash
sudo cp carersmind-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable carersmind-api
sudo systemctl start carersmind-api
```

## 6. Check Status
```bash
sudo systemctl status carersmind-api
sudo journalctl -u carersmind-api -f
```

## 7. Set Up SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.carersmind.co.uk
```
EOF

echo -e "${GREEN}✅ Deployment package created in: $DEPLOY_DIR${NC}"
echo ""
echo -e "${BLUE}📤 Next Steps:${NC}"
echo "1. Upload the contents of '$DEPLOY_DIR' to your IONOS server"
echo "2. Follow the DEPLOYMENT-INSTRUCTIONS.md file"
echo "3. Update your DNS to point api.carersmind.co.uk to your IONOS server"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- Make sure to update .env with your LIVE Stripe keys"
echo "- Set up SSL certificate for api.carersmind.co.uk"
echo "- Configure your domain DNS records"
echo ""
echo -e "${GREEN}🎉 Deployment package ready!${NC}"
