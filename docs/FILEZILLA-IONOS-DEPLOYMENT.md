# 🚀 FileZilla + IONOS Webspace Deployment Guide

## ⚡ **Deploy Your CarersMind API to IONOS Webspace**

Since you're using IONOS webspace (shared hosting) with FileZilla, here's the step-by-step deployment process:

---

## 📋 **Step 1: Prepare Your Deployment Package**

### **Windows Users:**
```cmd
cd server
deploy-ionos.bat
```

### **Linux/Mac Users:**
```bash
cd server
chmod +x deploy-ionos.sh
./deploy-ionos.sh
```

**✅ Result**: You'll get a `deploy-temp` folder with everything needed.

---

## 🌐 **Step 2: Deploy Frontend to Vercel**

```bash
cd docs
vercel --prod
```

**✅ Result**: Your frontend will be live at a Vercel URL.

---

## 📁 **Step 3: Deploy Backend to IONOS Webspace via FileZilla**

### **3.1: Open FileZilla**
- Download FileZilla Client if you haven't already
- Open FileZilla and go to **File → Site Manager**

### **3.2: Configure IONOS Connection**
```
Host: ftp.carersmind.co.uk (or your IONOS FTP hostname)
Port: 21 (or 22 for SFTP if available)
Protocol: FTP (or SFTP if available)
Encryption: Use explicit FTP over TLS if available
Logon Type: Normal
User: Your IONOS username
Password: Your IONOS password
```

### **3.3: Connect to IONOS**
- Click **Connect** in Site Manager
- Navigate to your webspace root directory (usually `/` or `/htdocs/`)

### **3.4: Create API Directory**
- Right-click in the right panel (remote site)
- Select **Create directory**
- Name it: `api` (this will create `/api/` on your webspace)

### **3.5: Upload Files**
- In the left panel (local site), navigate to your `deploy-temp` folder
- Select all files and folders
- Drag them to the right panel (remote site) into the `/api/` directory
- Wait for all uploads to complete

---

## ⚙️ **Step 4: Configure IONOS Webspace**

### **4.1: Set Up .htaccess for Node.js**
Create a `.htaccess` file in your `/api/` directory with this content:

```apache
# Enable Node.js
AddHandler application/x-httpd-php .php
AddHandler application/x-httpd-php .js

# Rewrite rules for API
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

### **4.2: Create index.php Entry Point**
Create `index.php` in your `/api/` directory:

```php
<?php
// IONOS Webspace Node.js Entry Point
$command = 'cd ' . __DIR__ . ' && node server.js';
$output = shell_exec($command);
echo $output;
?>
```

### **4.3: Update Environment Variables**
- Edit the `.env` file in your `/api/` directory
- Ensure these are set correctly:
  ```
  NODE_ENV=production
  PORT=5002
  STRIPE_SECRET_KEY=sk_live_your_key_here
  SUPABASE_URL=your_supabase_url
  SUPABASE_ANON_KEY=your_supabase_key
  JWT_SECRET=your_jwt_secret
  ```

---

## 🔗 **Step 5: Configure DNS**

### **In Your Domain Registrar (where you bought carersmind.co.uk):**

1. **Frontend (Vercel):**
   - Type: `CNAME`
   - Name: `@` (or leave blank)
   - Value: `cname.vercel-dns.com`

2. **Backend API (IONOS):**
   - Type: `CNAME`
   - Name: `api`
   - Value: `carersmind.co.uk` (or your IONOS domain)

**✅ Result**: 
- `carersmind.co.uk` → Vercel (frontend)
- `api.carersmind.co.uk` → IONOS webspace (backend)

---

## 🧪 **Step 6: Test Your Deployment**

### **Test Your API:**
```bash
curl https://api.carersmind.co.uk/health
```

### **Test Your Frontend:**
- Visit `https://carersmind.co.uk`
- Try logging in
- Test Stripe checkout
- Check all pages load

---

## 🆘 **IONOS Webspace Specific Issues**

### **Common Problems & Solutions:**

1. **"Node.js not available"**
   - IONOS webspace may not support Node.js
   - Contact IONOS support to enable Node.js
   - Alternative: Use IONOS VPS instead of webspace

2. **"Permission denied"**
   - Check file permissions in FileZilla
   - Right-click files → File permissions → Set to 644 for files, 755 for folders

3. **"Port 5002 blocked"**
   - IONOS webspace typically only allows ports 80/443
   - Update your server.js to use `process.env.PORT || 80`

4. **"Cannot start Node.js process"**
   - IONOS webspace may not allow background processes
   - Consider upgrading to IONOS VPS for full Node.js support

---

## 🔄 **Alternative: Upgrade to IONOS VPS**

If IONOS webspace doesn't support Node.js, consider upgrading to IONOS VPS:

### **Benefits:**
- ✅ Full Node.js support
- ✅ Custom port configuration
- ✅ Background process support
- ✅ Full server control

### **VPS Deployment:**
Follow the original `IONOS-QUICK-START.md` guide instead.

---

## 📞 **IONOS Support Contacts**

- **IONOS Webspace Support**: Check your hosting control panel
- **Node.js Support**: Contact IONOS to confirm Node.js availability
- **FTP Issues**: IONOS technical support

---

## 🎯 **Current Status**

**⚠️ IMPORTANT**: IONOS webspace may not support Node.js applications. If you encounter issues:

1. **Contact IONOS support** to confirm Node.js availability
2. **Consider upgrading to IONOS VPS** for full Node.js support
3. **Use the VPS deployment guide** instead of this webspace guide

**🚀 Next Step**: Try the FileZilla deployment, but be prepared to upgrade to VPS if needed!
