# Deployment Guide

Complete guide for deploying the Shop Floor Resource Allocation System to production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Build for Production](#build-for-production)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel](#vercel-recommended)
  - [Netlify](#netlify)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
  - [Docker](#docker)
  - [Azure Static Web Apps](#azure-static-web-apps)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Strategy](#rollback-strategy)

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Production build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] API endpoints updated to production URLs
- [ ] Security audit passed (`npm audit`)
- [ ] Performance tested (Lighthouse score > 90)
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Backup and rollback plan ready

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```bash
# Application
VITE_APP_NAME=Shop Floor Resource Allocation
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production

# API Configuration
VITE_API_URL=https://api.production.com/v1
VITE_API_TIMEOUT=10000

# WebSocket
VITE_WS_URL=wss://api.production.com/ws
VITE_WS_RECONNECT_DELAY=3000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_MOCK_DATA=false

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Refresh Intervals
VITE_REFRESH_INTERVAL=5000
VITE_METRICS_REFRESH_INTERVAL=10000

# Debug (should be false in production)
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

### Security Considerations

⚠️ **Never commit `.env` files to version control**

**Secure ways to manage secrets:**

1. **Environment Variables in CI/CD:**
   - GitHub Actions: Repository Secrets
   - GitLab: CI/CD Variables
   - Bitbucket: Repository Variables

2. **Secret Management Tools:**
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - Google Secret Manager

3. **Platform-specific:**
   - Vercel: Environment Variables in Dashboard
   - Netlify: Environment Variables in Site Settings

---

## Build for Production

### Standard Build Process

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Run type checker
npm run type-check

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Output

The build creates optimized files in `dist/`:

```
dist/
├── assets/
│   ├── index-[hash].js      # Application JavaScript
│   ├── index-[hash].css     # Application CSS
│   └── [name]-[hash].*      # Other assets
└── index.html               # Entry HTML
```

### Build Optimization

**Analyze Bundle Size:**

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});

# Build and view analysis
npm run build
```

**Optimize Output:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'dnd-vendor': ['react-dnd', 'react-dnd-html5-backend'],
        }
      }
    }
  }
});
```

---

## Deployment Platforms

### Vercel (Recommended)

**Best for:** Zero-config deployment, automatic HTTPS, global CDN

#### Deploy via CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Deploy to production:**
```bash
vercel --prod
```

#### Deploy via Git Integration

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables
5. Deploy

#### vercel.json Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### Netlify

**Best for:** Simple deployment, form handling, serverless functions

#### Deploy via CLI

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build and deploy:**
```bash
npm run build
netlify deploy --prod
```

#### Deploy via Git Integration

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variables
5. Deploy

#### netlify.toml Configuration

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

---

### AWS S3 + CloudFront

**Best for:** AWS ecosystem, fine-grained control, custom domains

#### Step 1: Build Application

```bash
npm run build
```

#### Step 2: Create S3 Bucket

```bash
aws s3 mb s3://shop-floor-allocation
aws s3 website s3://shop-floor-allocation --index-document index.html --error-document index.html
```

#### Step 3: Upload Files

```bash
aws s3 sync dist/ s3://shop-floor-allocation --delete
```

#### Step 4: Set Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::shop-floor-allocation/*"
    }
  ]
}
```

#### Step 5: Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name shop-floor-allocation.s3.amazonaws.com \
  --default-root-object index.html
```

#### Automated Deployment Script

```bash
#!/bin/bash
# deploy-aws.sh

set -e

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://shop-floor-allocation \
  --delete \
  --cache-control "max-age=31536000" \
  --exclude "index.html"

aws s3 cp dist/index.html s3://shop-floor-allocation/index.html \
  --cache-control "no-cache"

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id E1234EXAMPLE \
  --paths "/*"

echo "Deployment complete!"
```

---

### Docker

**Best for:** Containerized deployments, Kubernetes, self-hosting

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Build and Run Docker Image

```bash
# Build image
docker build -t shop-floor-allocation:latest .

# Run container
docker run -d -p 80:80 \
  --name shop-floor-app \
  shop-floor-allocation:latest

# View logs
docker logs shop-floor-app

# Stop container
docker stop shop-floor-app
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

### Azure Static Web Apps

**Best for:** Azure ecosystem, authentication integration

#### Deploy via Azure CLI

1. **Install Azure CLI:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

2. **Login to Azure:**
```bash
az login
```

3. **Create Static Web App:**
```bash
az staticwebapp create \
  --name shop-floor-allocation \
  --resource-group myResourceGroup \
  --source https://github.com/username/repo \
  --location "East US" \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

#### staticwebapp.config.json

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*"]
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  },
  "routes": [
    {
      "route": "/assets/*",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  ]
}
```

---

## Post-Deployment

### Verification Checklist

After deployment:

- [ ] Application loads correctly
- [ ] All routes work (test navigation)
- [ ] API connections successful
- [ ] Drag and drop functionality works
- [ ] Metrics display correctly
- [ ] Responsive design on mobile
- [ ] Console has no errors
- [ ] Performance acceptable (Lighthouse)
- [ ] HTTPS working
- [ ] Custom domain configured (if applicable)

### Performance Testing

```bash
# Using Lighthouse CLI
npm install -g @lhci/cli

lhci autorun --collect.url=https://your-domain.com
```

### Smoke Tests

```bash
# Quick health check
curl -I https://your-domain.com

# Check specific endpoints
curl https://your-domain.com/assets/index.js
```

---

## Monitoring & Maintenance

### Set Up Monitoring

1. **Sentry for Error Tracking:**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_NODE_ENV,
  tracesSampleRate: 1.0,
});
```

2. **Google Analytics:**
```typescript
import ReactGA from 'react-ga4';

ReactGA.initialize(import.meta.env.VITE_GA_TRACKING_ID);
```

3. **Uptime Monitoring:**
   - [UptimeRobot](https://uptimerobot.com)
   - [Pingdom](https://www.pingdom.com)
   - AWS CloudWatch

### Regular Maintenance

**Weekly:**
- Review error logs
- Check performance metrics
- Monitor user feedback

**Monthly:**
- Update dependencies (`npm update`)
- Security audit (`npm audit`)
- Performance audit (Lighthouse)

**Quarterly:**
- Review and update documentation
- Conduct security review
- Plan feature updates

---

## Rollback Strategy

### Quick Rollback

**Vercel:**
```bash
# View deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

**Netlify:**
```bash
# View deploys
netlify deploy:list

# Restore deploy
netlify deploy:restore [deploy-id]
```

**AWS S3:**
```bash
# Enable versioning first
aws s3api put-bucket-versioning \
  --bucket shop-floor-allocation \
  --versioning-configuration Status=Enabled

# List versions
aws s3api list-object-versions \
  --bucket shop-floor-allocation

# Restore previous version
aws s3api copy-object \
  --copy-source shop-floor-allocation/index.html?versionId=VERSION_ID \
  --bucket shop-floor-allocation \
  --key index.html
```

### Rollback Checklist

- [ ] Identify the issue
- [ ] Communicate with team
- [ ] Rollback to last stable version
- [ ] Verify rollback successful
- [ ] Document the incident
- [ ] Plan fix for next deployment

---

## CI/CD Pipeline Example

### GitHub Actions Workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Support

For deployment issues:
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review platform-specific documentation
- Check application logs
- Contact DevOps team

---

**Last Updated:** 2024
