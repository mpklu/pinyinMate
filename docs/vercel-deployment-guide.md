# Vercel Deployment Guide for React/Vite Applications

This guide covers deploying a React/Vite application to Vercel, including common issues encountered and their solutions based on real deployment experience.

## Table of Contents
- [Step-by-Step Deployment Guide](#step-by-step-deployment-guide)
- [Configuration Files](#configuration-files)
- [Common Issues & Solutions](#common-issues--solutions)
- [Troubleshooting FAQs](#troubleshooting-faqs)
- [Best Practices](#best-practices)

## Step-by-Step Deployment Guide

### 1. Initial Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

### 2. Project Preparation

1. **Ensure your build script works locally**
   ```bash
   npm run build
   npm run preview  # Test the built version
   ```

2. **Create or verify `vercel.json` configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "rewrites": [
       {
         "source": "/((?!assets|vite\\.svg|manifest\\.json|lessons).*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### 3. Deployment Process

1. **Initial deployment**
   ```bash
   vercel
   ```
   - Follow interactive prompts
   - Choose project settings
   - Get preview URL

2. **Production deployment**
   ```bash
   vercel --prod
   ```

   ```bash
   npm run build && vercel --prod
   ```

3. **Verify deployment**
   - Test the provided URL
   - Check all routes work correctly
   - Verify static assets load properly

## Configuration Files

### `vercel.json` Structure

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/((?!assets|vite\\.svg|manifest\\.json|lessons).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key Points:**
- `buildCommand`: Command to build your application
- `outputDirectory`: Directory containing built files (usually `dist` for Vite)
- `rewrites`: Handle SPA routing by excluding static assets

### Critical Rewrite Pattern

The rewrite pattern `/((?!assets|vite\\.svg|manifest\\.json|lessons).*)` ensures:
- Static assets in `/assets/` are served directly
- Specific files like `vite.svg`, `manifest.json` are served directly
- Custom directories like `/lessons/` are served directly
- All other routes go to `index.html` for React Router handling

## Common Issues & Solutions

### 1. "Unexpected token '<'" Error

**Problem**: JSON files returning HTML instead of JSON content.

**Cause**: Vercel routing configuration intercepting API/JSON requests and serving `index.html`.

**Solution**: 
- Embed JSON configuration directly in JavaScript
- Use ES6 imports instead of fetch for configuration data
- Update rewrite patterns to exclude your JSON endpoints

```typescript
// Instead of fetch('/config.json')
import config from './config/embedded-config.js';

// embedded-config.js
export default {
  sources: [
    // your configuration
  ]
};
```

### 2. Static Files Not Loading

**Problem**: CSS, JS, or other static assets returning 404 or wrong content.

**Cause**: Aggressive SPA rewrites intercepting static file requests.

**Solution**: Update `vercel.json` rewrite pattern to exclude static directories:

```json
{
  "source": "/((?!assets|public|static|_next).*)",
  "destination": "/index.html"
}
```

### 3. CORS Issues with External APIs

**Problem**: External API calls fail in production but work locally.

**Cause**: Browser CORS policies block requests to external domains.

**Solutions**:
1. **Graceful Error Handling** (Recommended for non-critical features):
   ```typescript
   async function loadExternalData() {
     try {
       const response = await fetch(externalUrl);
       return await response.json();
     } catch (error) {
       console.warn('External data unavailable:', error);
       return []; // Return safe fallback
     }
   }
   ```

2. **Server-side Proxy** (For critical features):
   ```typescript
   // api/proxy.ts
   export default async function handler(req, res) {
     const response = await fetch(externalUrl);
     const data = await response.json();
     res.json(data);
   }
   ```

### 4. Function Runtime Errors

**Problem**: "Function Runtimes must have a valid version" error.

**Cause**: Invalid or incomplete Vercel Functions configuration.

**Solution**: Either properly configure functions or remove the configuration:

```json
// Remove or fix functions config in vercel.json
{
  "functions": {
    "api/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 5. TypeScript Compilation Issues

**Problem**: Build fails with TypeScript errors in production.

**Cause**: Stricter production build settings or missing type definitions.

**Solutions**:
- Fix TypeScript errors locally first
- Use proper type imports: `import type { Type } from './types'`
- Ensure all dependencies have proper type definitions

## Troubleshooting FAQs

### Q: Why does my app work locally but not on Vercel?

**A**: Common causes:
1. Different Node.js versions
2. Missing environment variables
3. Routing configuration issues
4. CORS problems with external APIs
5. Case-sensitive file paths (Vercel is case-sensitive)

### Q: How do I debug routing issues?

**A**: 
1. Check browser network tab for 404s
2. Verify `vercel.json` rewrite patterns
3. Test specific routes directly in browser
4. Add console logs to identify which routes fail

### Q: Why are my JSON files returning HTML?

**A**: Your rewrite pattern is too broad and intercepting JSON requests. Either:
1. Exclude JSON files in rewrite pattern
2. Embed JSON data in JavaScript modules
3. Move JSON files to excluded directories

### Q: How do I handle external API failures gracefully?

**A**: Implement try-catch blocks with fallback data:
```typescript
try {
  const data = await fetchExternalAPI();
  return data;
} catch (error) {
  console.warn('API unavailable, using fallback');
  return fallbackData;
}
```

### Q: My build succeeds but the site is broken. What now?

**A**: 
1. Check the Vercel deployment logs
2. Open browser developer console for client-side errors
3. Test the production build locally: `npm run build && npm run preview`
4. Verify all environment variables are set in Vercel dashboard

## Best Practices

### 1. Configuration Management
- Keep JSON configs in JavaScript modules for better build integration
- Use environment variables for API keys and URLs
- Test configuration loading in both development and production

### 2. Error Handling
- Implement graceful degradation for non-critical external services
- Use try-catch blocks around all external API calls
- Provide user-friendly error messages

### 3. Routing Setup
- Start with restrictive rewrite patterns and expand as needed
- Always exclude static asset directories
- Test all routes after deployment

### 4. Performance Optimization
- Minimize external API calls during initial load
- Cache external data when possible
- Use lazy loading for non-critical features

### 5. Development Workflow
```bash
# 1. Test locally
npm run build
npm run preview

# 2. Deploy to preview
vercel

# 3. Test preview thoroughly
# 4. Deploy to production
vercel --prod
```

### 6. Monitoring and Debugging
- Add console.debug statements for production debugging
- Use Vercel's built-in analytics
- Monitor deployment logs regularly
- Set up error tracking (Sentry, etc.)

## Example Successful Configuration

Based on our successful deployment, here's a proven configuration:

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/((?!assets|vite\\.svg|manifest\\.json|lessons).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Service Architecture**:
```typescript
// Embed config instead of fetching
import defaultSources from './config/embedded-sources.js';

export class LibrarySourceService {
  async initialize() {
    try {
      // Use embedded config with graceful external loading
      this.sources = defaultSources;
      await this.loadExternalSources(); // Non-blocking
    } catch (error) {
      console.warn('Using fallback configuration');
      this.sources = defaultSources;
    }
  }
  
  async loadExternalSources() {
    try {
      // Attempt external loading without blocking
      const external = await this.fetchExternalSources();
      this.sources = [...this.sources, ...external];
    } catch (error) {
      // Fail silently, external sources optional
      console.debug('External sources unavailable');
    }
  }
}
```

This configuration provides a robust, production-ready deployment that handles failures gracefully while maintaining core functionality.