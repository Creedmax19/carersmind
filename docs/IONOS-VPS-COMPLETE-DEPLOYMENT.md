# 🚀 IONOS VPS Complete Deployment Guide

## ⚡ **Host Both Frontend & Backend on IONOS VPS**

**This is the MOST RECOMMENDED approach** - cost-effective, reliable, and gives you full control.

---

## 🎯 **Why This Approach is Best:**

### **✅ Advantages:**
- **Single hosting provider** - Everything in one place
- **Cost-effective** - £5-10/month for everything
- **Full control** - Install any software you need
- **Scalable** - Handle hundreds of visitors easily
- **Professional** - Enterprise-grade hosting
- **No vendor lock-in** - You own your infrastructure

### **❌ Why IONOS Webspace Won't Work:**
- No Node.js support
- No background processes
- Port restrictions
- Limited control

---

## 📋 **Step 1: Prepare Your Deployment Packages**

### **Backend Package:**
```cmd
cd server
deploy-ionos.bat
```

### **Frontend Package:**
```cmd
cd docs
deploy-ionos-frontend.bat
```

**✅ Result**: You'll get both `deploy-temp` and `deploy-frontend` folders.

---

## 🌐 **Step 2: Deploy to IONOS VPS**

### **2.1: Access Your IONOS VPS**
```bash
ssh root@your-ionos-vps-ip
```

### **2.2: Install Required Software**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install nginx
apt install nginx -y

# Install certbot for SSL
apt install certbot python3-certbot-nginx -y

# Install PM2 for process management
npm install -g pm2
```

### **2.3: Create Directory Structure**
```bash
# Create directories
mkdir -p /var/www/carersmind.co.uk
mkdir -p /var/www/api.carersmind.co.uk
mkdir -p /var/www/backups

# Set permissions
chown -R www-data:www-data /var/www/
chmod -R 755 /var/www/
```

### **2.4: Upload Backend Files**
```bash
# Upload deploy-temp contents to /var/www/api.carersmind.co.uk/
# Use SFTP, SCP, or IONOS file manager

cd /var/www/api.carersmind.co.uk
npm ci --only=production
```

### **2.5: Upload Frontend Files**
```bash
# Upload deploy-frontend contents to /var/www/carersmind.co.uk/
# Use SFTP, SCP, or IONOS file manager
```

---

## ⚙️ **Step 3: Configure Nginx**

### **3.1: Frontend Configuration**
Create `/etc/nginx/sites-available/carersmind.co.uk`:

```nginx
server {
    listen 80;
    server_name carersmind.co.uk www.carersmind.co.uk;
    root /var/www/carersmind.co.uk;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### **3.2: Backend API Configuration**
Create `/etc/nginx/sites-available/api.carersmind.co.uk`:

```nginx
server {
    listen 80;
    server_name api.carersmind.co.uk;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

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
```

### **3.3: Enable Sites**
```bash
# Enable sites
ln -s /etc/nginx/sites-available/carersmind.co.uk /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api.carersmind.co.uk /etc/nginx/sites-enabled/

# Test and reload
nginx -t
systemctl reload nginx
```

---

## 🔧 **Step 4: Configure Backend Service**

### **4.1: Create PM2 Ecosystem File**
Create `/var/www/api.carersmind.co.uk/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'carersmind-api',
    script: 'server.js',
    cwd: '/var/www/api.carersmind.co.uk',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5002
    },
    error_file: '/var/www/backups/api-error.log',
    out_file: '/var/www/backups/api-out.log',
    log_file: '/var/www/backups/api-combined.log',
    time: true,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### **4.2: Start the API Service**
```bash
cd /var/www/api.carersmind.co.uk
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔒 **Step 5: Set Up SSL Certificates**

### **5.1: Generate SSL for Frontend**
```bash
certbot --nginx -d carersmind.co.uk -d www.carersmind.co.uk
```

### **5.2: Generate SSL for API**
```bash
certbot --nginx -d api.carersmind.co.uk
```

---

## 🔗 **Step 6: Configure DNS**

### **In Your Domain Registrar:**
1. **Frontend:**
   - Type: `A`
   - Name: `@` (or leave blank)
   - Value: `your-ionos-vps-ip`

2. **Backend API:**
   - Type: `A`
   - Name: `api`
   - Value: `your-ionos-vps-ip`

**✅ Result**: Both domains point to your IONOS VPS.

---

## 🧪 **Step 7: Test Everything**

### **Test Frontend:**
```bash
curl -I https://carersmind.co.uk
```

### **Test Backend:**
```bash
curl https://api.carersmind.co.uk/health
```

### **Test Frontend in Browser:**
- Visit `https://carersmind.co.uk`
- Try logging in
- Test Stripe checkout
- Check all pages load

---

## 📊 **Monitoring & Maintenance**

### **Check API Status:**
```bash
pm2 status
pm2 logs carersmind-api
```

### **Check Nginx Status:**
```bash
systemctl status nginx
nginx -t
```

### **Check SSL Certificates:**
```bash
certbot certificates
```

---

## 💰 **Cost Breakdown**

### **IONOS VPS Plan:**
- **Basic VPS**: £5-8/month
- **Standard VPS**: £8-12/month (recommended)
- **Premium VPS**: £12-20/month

### **What You Get:**
- ✅ Full Node.js support
- ✅ Unlimited bandwidth
- ✅ Professional hosting
- ✅ Full control
- ✅ Scalability

---

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **"Permission denied"** - Check file ownership and permissions
2. **"Port already in use"** - Ensure no other services use port 5002
3. **"SSL errors"** - Verify DNS propagation and SSL certificate generation

### **Support:**
- **IONOS VPS Support**: 24/7 technical support
- **Documentation**: Complete deployment guides provided

---

## 🎉 **You're Live!**

**✅ Status**: **100% Production Ready on IONOS VPS!**

Your site can now handle hundreds of visitors with:
- ✅ Professional frontend on IONOS VPS
- ✅ Scalable backend on IONOS VPS
- ✅ Live Stripe payments
- ✅ SSL security
- ✅ Professional domain
- ✅ Full control and scalability

---

## 🚀 **Next Steps:**

1. **Run deployment scripts** to create packages
2. **Deploy to IONOS VPS** following this guide
3. **Test everything** thoroughly
4. **Monitor performance** and scale as needed

**🎯 This approach gives you enterprise-grade hosting at a fraction of the cost!**
