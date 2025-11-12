# Setup Guide - QR Code Label Generator

Complete guide for setting up and running the QR Code Label Generator application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Production Build](#production-build)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [Troubleshooting](#troubleshooting)
- [IDE Setup](#ide-setup)

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control

### Verify Installation

```bash
node --version   # Should be v18.x or higher
npm --version    # Should be v9.x or higher
git --version    # Any recent version
```

### Recommended Tools

- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
- **Chrome DevTools**: For debugging
- **Postman/Insomnia**: For API testing (if integrating backend)

## Installation

### 1. Clone Repository

```bash
# HTTPS
git clone https://github.com/tristonal-alt/Qr-Label-Generator-React.git

# SSH
git clone git@github.com:tristonal-alt/Qr-Label-Generator-React.git

# Navigate to project directory
cd Qr-Label-Generator-React
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 19.2
- TypeScript 5.8
- Vite 6.2
- Tailwind CSS 3.4
- QRCode library
- ESLint & Prettier
- Type definitions

**Expected output:**
```
added 296 packages, and audited 297 packages in 21s
found 0 vulnerabilities
```

### 3. Verify Installation

```bash
# Check TypeScript compilation
npm run type-check

# Check linting
npm run lint

# Check formatting
npm run format:check
```

All commands should complete without errors.

## Development Setup

### Start Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v6.4.1  ready in 423 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.x:3000/
```

### Development Features

- **Hot Module Replacement (HMR)**: Changes reflect instantly
- **Fast Refresh**: Component state preserved on edits
- **TypeScript Checking**: Real-time type errors
- **ESLint Integration**: Code quality warnings
- **Source Maps**: Easy debugging

### Project Configuration

#### TypeScript Configuration

The project uses strict TypeScript configuration (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### Tailwind Configuration

Tailwind is configured to scan all component files (`tailwind.config.js`):

```javascript
content: [
  "./index.html",
  "./index.tsx",
  "./App.tsx",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./utils/**/*.{js,ts,jsx,tsx}",
]
```

#### Vite Configuration

Vite is configured for React and path aliases (`vite.config.ts`):

```typescript
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

### Customization

#### Change Default Port

Edit `vite.config.ts`:

```typescript
server: {
  port: 8080, // Change to desired port
  host: '0.0.0.0',
}
```

#### Customize Default Values

Edit `constants/index.ts`:

```typescript
export const DEFAULT_VALUES = {
  STOCK_CODE: 'YOUR-SKU-001',
  WAREHOUSE: 'YOUR-WH',
  BIN: 'YOUR-BIN',
  PRODUCT_CLASS: 'Your Category',
};
```

#### Customize Validation Rules

Edit `constants/index.ts`:

```typescript
export const VALIDATION_PATTERNS = {
  STOCK_CODE: /^[A-Za-z0-9_-]{1,50}$/,  // Max 50 chars
  WAREHOUSE: /^[A-Z]{2,10}$/,           // 2-10 uppercase
  BIN: /^[A-Z]\d-[A-Z]\d-[A-Z]\d$/,     // Strict format
  PRODUCT_CLASS: /^[A-Za-z\s]{3,30}$/,  // 3-30 chars
};
```

## Production Build

### Build for Production

```bash
npm run build
```

**Expected output:**
```
vite v6.4.1 building for production...
✓ 83 modules transformed.
dist/index.html                   0.50 kB │ gzip:  0.34 kB
dist/assets/index-CJaj_9Kn.css   12.22 kB │ gzip:  3.17 kB
dist/assets/index-BMWBSj1R.js   229.37 kB │ gzip: 73.82 kB
✓ built in 2.24s
```

Build output is in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Opens preview server at `http://localhost:4173`

### Build Optimization

The build is optimized with:
- **Code Splitting**: Separate chunks for better caching
- **Minification**: Terser for JS, cssnano for CSS
- **Tree Shaking**: Dead code elimination
- **Gzip Compression**: Smaller bundle sizes
- **Source Maps**: For debugging (optional)

### Deployment Options

#### 1. Static Hosting (Vercel, Netlify)

```bash
# Build the project
npm run build

# Deploy dist/ folder to your hosting provider
```

#### 2. Docker Container

See [Docker Setup](#docker-setup) section below.

#### 3. Node.js Server

Serve the `dist/` folder with any static file server:

```bash
npm install -g serve
serve -s dist -l 3000
```

## Environment Variables

The app currently doesn't require environment variables, but you can add them:

### Create Environment File

```bash
# Development
touch .env.local

# Production
touch .env.production
```

### Add Variables

```bash
# .env.local
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=QR Label Generator
VITE_MAX_QR_SIZE=1000
```

### Use in Code

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

**Note**: Environment variables must be prefixed with `VITE_` to be exposed to the client.

## Docker Setup

### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  qr-generator:
    build: .
    ports:
      - "3000:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

### Build and Run

```bash
# Build Docker image
docker build -t qr-label-generator .

# Run container
docker run -p 3000:80 qr-label-generator

# Or use docker-compose
docker-compose up -d
```

Access at `http://localhost:3000`

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
```

#### 2. Module Not Found

**Error**: `Cannot find module 'X'`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript Errors

**Error**: TypeScript compilation errors

**Solution**:
```bash
# Run type check to see all errors
npm run type-check

# Check tsconfig.json is correct
# Ensure all @types packages are installed
```

#### 4. Tailwind Styles Not Loading

**Error**: Styles not applied

**Solution**:
```bash
# Ensure Tailwind is installed
npm install -D tailwindcss postcss autoprefixer

# Verify tailwind.config.js exists
# Verify index.css imports Tailwind directives
# Restart dev server
```

#### 5. Build Fails

**Error**: Build process fails

**Solution**:
```bash
# Clear dist folder
rm -rf dist

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

#### 6. QR Code Not Generating

**Error**: QR generation fails silently

**Solution**:
- Check browser console for errors
- Verify all input fields are filled
- Check validation patterns in constants/index.ts
- Ensure qrcode package is installed

### Performance Issues

#### Slow Build Times

```bash
# Use pnpm for faster installs
npm install -g pnpm
pnpm install

# Or use npm ci for clean installs
npm ci
```

#### Large Bundle Size

- Check bundle analyzer:
```bash
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts
```

- Enable code splitting
- Lazy load components
- Optimize images

### Development Issues

#### Hot Reload Not Working

```bash
# Restart dev server
# Check file watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### ESLint Errors

```bash
# Auto-fix ESLint issues
npm run lint:fix

# Check ESLint config
cat eslint.config.js
```

## IDE Setup

### VS Code

#### Recommended Extensions

Install these extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

#### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### WebStorm / IntelliJ

1. Open project
2. Enable ESLint: **Settings → Languages → JavaScript → Code Quality Tools → ESLint**
3. Enable Prettier: **Settings → Languages → JavaScript → Prettier**
4. Set Node interpreter: **Settings → Languages → Node.js**

## Next Steps

- ✅ Installation complete
- 📖 Read [SQL_INTEGRATION.md](./docs/SQL_INTEGRATION.md) for database setup
- 🚀 Read [API_EXAMPLES.md](./docs/API_EXAMPLES.md) for backend integration
- 🎨 Customize the app in `constants/index.ts`
- 🧪 Add tests (Jest/Vitest)
- 🚢 Deploy to production

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev/guide)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [QRCode Library](https://www.npmjs.com/package/qrcode)

## Support

For issues:
1. Check this setup guide
2. Check [GitHub Issues](https://github.com/tristonal-alt/Qr-Label-Generator-React/issues)
3. Open a new issue with:
   - Node/npm versions
   - Error messages
   - Steps to reproduce

---

**Last Updated**: 2025-11-12
