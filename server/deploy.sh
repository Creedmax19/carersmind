#!/bin/bash

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt install -y nodejs npm nginx

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Navigate to project directory
cd /var/www/api.carersmind.co.uk

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --production

# Set up environment variables
echo "Setting up environment..."
cp .env.example .env
nano .env  # User needs to edit this

# Build the application if needed
# echo "Building application..."
# npm run build

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start index.js --name carersmind-api

# Configure PM2 to start on boot
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Set up Nginx reverse proxy
echo "Setting up Nginx..."
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null

# Create Nginx config
sudo tee /etc/nginx/sites-available/api.carersmind.co.uk > /dev/null <<EOL
server {
    listen 80;
    server_name api.carersmind.co.uk;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOL

# Enable the site
sudo ln -sf /etc/nginx/sites-available/api.carersmind.co.uk /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
echo "Setting up SSL..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.carersmind.co.uk --non-interactive --agree-tos -m your-email@example.com --redirect

# Set up auto-renewal
echo "Setting up SSL auto-renewal..."
(sudo crontab -l 2>/dev/null; echo "0 0,12 * * * root /usr/bin/certbot renew --quiet") | sudo crontab -

echo "Deployment complete!"
echo "Your API is now running at https://api.carersmind.co.uk"
