# Deployment Guide

This guide provides comprehensive instructions for deploying the Online Learning Platform to various environments.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL database
- Domain name (for production)
- SSL certificate (recommended for production)

## 🚀 Production Deployment

### 1. Server Setup

#### Ubuntu/Debian Server Setup
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y
```

### 2. Database Setup

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE online_learning_platform;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON online_learning_platform.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Deployment

```bash
# Clone the repository
git clone <your-repository-url>
cd online-learning-platform

# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Build the frontend
cd client && npm run build
cd ..

# Set up environment variables
cp server/env.example server/.env
```

### 4. Environment Configuration

Edit `server/.env` with production values:

```env
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=online_learning_platform
DB_USER=app_user
DB_PASSWORD=secure_password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-for-production
JWT_EXPIRES_IN=7d

# Admin Credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_admin_password

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 5. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'learning-platform',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 6. Start the Application

```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 7. Nginx Configuration (Optional)

Create `/etc/nginx/sites-available/learning-platform`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

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

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }

    # API documentation
    location /api-docs {
        proxy_pass http://localhost:5000;
    }

    # Static files
    location / {
        root /path/to/your/app/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/learning-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🐳 Docker Deployment

### 1. Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: learning_platform_db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: online_learning_platform
      MYSQL_USER: app_user
      MYSQL_PASSWORD: app_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  app:
    build: .
    container_name: learning_platform_app
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_NAME: online_learning_platform
      DB_USER: app_user
      DB_PASSWORD: app_password
      JWT_SECRET: your-jwt-secret
    depends_on:
      - mysql
    volumes:
      - ./uploads:/app/server/uploads

volumes:
  mysql_data:
```

### 2. Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Select appropriate instance type (t3.medium recommended)
   - Configure security groups (ports 22, 80, 443)

2. **Setup Application**
   ```bash
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Follow the server setup steps above
   ```

3. **RDS Database Setup**
   - Create MySQL RDS instance
   - Update DB_HOST in environment variables

### Heroku Deployment

1. **Prepare for Heroku**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login to Heroku
   heroku login
   
   # Create app
   heroku create your-app-name
   ```

2. **Configure Environment**
   ```bash
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-jwt-secret
   
   # Add MySQL addon
   heroku addons:create cleardb:ignite
   ```

3. **Deploy**
   ```bash
   # Add Heroku remote
   git remote add heroku https://git.heroku.com/your-app-name.git
   
   # Deploy
   git push heroku main
   ```

### DigitalOcean App Platform

1. **Create App**
   - Connect your GitHub repository
   - Choose Node.js environment

2. **Configure Build Settings**
   ```yaml
   name: learning-platform
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/your-repo
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
     - key: JWT_SECRET
       value: your-jwt-secret
   ```

## 🔧 Environment Variables

### Required Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=online_learning_platform
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password
```

### Optional Variables
```env
# File upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
ALLOWED_ORIGINS=https://yourdomain.com

# Rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Email (if implementing email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🔐 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure JWT secret
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use strong database passwords
- [ ] Keep dependencies updated
- [ ] Configure proper firewall rules
- [ ] Enable database encryption
- [ ] Set up monitoring and logging
- [ ] Regular security audits

## 📊 Monitoring and Maintenance

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart app
pm2 restart learning-platform

# Update app
git pull origin main
npm run build
pm2 restart learning-platform
```

### Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u app_user -p online_learning_platform > backup_$DATE.sql
```

### Log Rotation
```bash
# Setup logrotate
sudo nano /etc/logrotate.d/learning-platform

/path/to/your/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Test connection
   mysql -u app_user -p -h localhost online_learning_platform
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port
   sudo lsof -i :5000
   
   # Kill process
   sudo kill -9 PID
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R ubuntu:ubuntu /path/to/your/app
   chmod -R 755 /path/to/your/app
   ```

4. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   
   # Increase swap if needed
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 📈 Performance Optimization

1. **Enable Gzip Compression** (Nginx)
2. **Use CDN** for static assets
3. **Database Indexing** for frequently queried fields
4. **Connection Pooling** in database configuration
5. **Caching** with Redis (optional)
6. **Load Balancing** for high traffic

This deployment guide ensures your Online Learning Platform runs efficiently and securely in production environments.