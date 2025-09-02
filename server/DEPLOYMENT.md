# Backend Deployment Guide

This guide will help you deploy the Carer's Care CIC backend to your VPS.

## Prerequisites

- Ubuntu 20.04/22.04 server
- Node.js 16.x or later
- npm 8.x or later
- Nginx
- PM2 (will be installed by the script)
- Domain name (api.carersmind.co.uk) pointing to your server's IP

## Deployment Steps

1. **Connect to your VPS**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone the repository**
   ```bash
   sudo mkdir -p /var/www/api.carersmind.co.uk
   sudo chown -R $USER:$USER /var/www/api.carersmind.co.uk
   cd /var/www/api.carersmind.co.uk
   git clone your-repository-url .
   ```

3. **Install dependencies**
   ```bash
   npm install --production
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   nano .env
   ```
   Update the following variables:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL=https://carersmind.co.uk`

5. **Make the deployment script executable and run it**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

6. **Verify the deployment**
   ```bash
   # Check if the server is running
   curl https://api.carersmind.co.uk/api/health
   
   # Check PM2 status
   pm2 status
   
   # Check Nginx status
   sudo systemctl status nginx
   ```

## Updating the Application

1. Pull the latest changes
   ```bash
   cd /var/www/api.carersmind.co.uk
   git pull origin main
   ```

2. Restart the application
   ```bash
   pm2 restart carersmind-api
   ```

## Troubleshooting

- **Check PM2 logs**: `pm2 logs carersmind-api`
- **Check Nginx logs**: `sudo tail -f /var/log/nginx/error.log`
- **Check application logs**: `pm2 logs carersmind-api --lines 100`

## Security Considerations

- Keep your environment variables secure
- Regularly update your server and dependencies
- Use strong passwords and API keys
- Enable automatic security updates
- Set up a firewall (UFW)
- Monitor your server logs regularly
