# Deployment Guide

## Quick Start: From Figma Make to GitHub

### Step 1: Export Files from Figma Make

Use the **EXPORT_CHECKLIST.md** to guide you through downloading all necessary files.

**Minimum required files (15 core files):**
1. App.tsx
2. GrainyGradient.tsx
3. LinearWaveGradient.tsx
4. RadialGradient.tsx
5. AudioAnalyzer.tsx
6. AudioControls.tsx
7. AudioSpectrum.tsx
8. GradientControls.tsx
9. GradientTypeControls.tsx
10. PaletteControls.tsx
11. ColorPicker.tsx
12. RandomGenerator.tsx
13. ErrorBoundary.tsx
14. globals.css
15. UI components (button, slider, etc.)

### Step 2: Create GitHub Repository

```bash
# Create a new repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/gradient-generator.git
cd gradient-generator
```

### Step 3: Set Up Project Structure

```bash
# Create folder structure
mkdir -p src/components/ui
mkdir -p src/imports
mkdir -p src/styles
mkdir -p public
```

### Step 4: Copy Files

Place your exported files in the correct locations:
```
src/
├── App.tsx
├── components/
│   ├── GrainyGradient.tsx
│   ├── LinearWaveGradient.tsx
│   ├── RadialGradient.tsx
│   ├── AudioAnalyzer.tsx
│   ├── AudioControls.tsx
│   ├── AudioSpectrum.tsx
│   ├── GradientControls.tsx
│   ├── GradientTypeControls.tsx
│   ├── PaletteControls.tsx
│   ├── ColorPicker.tsx
│   ├── RandomGenerator.tsx
│   ├── ErrorBoundary.tsx
│   └── ui/
│       ├── button.tsx
│       ├── slider.tsx
│       ├── card.tsx
│       ├── collapsible.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       └── utils.ts
├── imports/
│   ├── Layer1.tsx
│   └── Group1.tsx
└── styles/
    └── globals.css
```

### Step 5: Create Configuration Files

Create these files in the root directory:

**package.json** - Already provided in repo

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tsconfig.node.json:**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**index.html:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gradient Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**src/main.tsx:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**.gitignore:**
```
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Editor directories
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
```

### Step 6: Install Dependencies

```bash
npm install
```

### Step 7: Update Import Paths

Update all imports from absolute to relative paths:

**Before (Figma Make):**
```typescript
import { Button } from "/components/ui/button"
```

**After (Vite):**
```typescript
import { Button } from "./components/ui/button"
// or with path alias:
import { Button } from "@/components/ui/button"
```

Use find-and-replace:
- `/components/` → `./components/`
- `/imports/` → `./imports/`
- `/styles/` → `./styles/`

### Step 8: Test Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

### Step 9: Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized static files.

### Step 10: Commit and Push to GitHub

```bash
git add .
git commit -m "Initial commit: Gradient generator app"
git push origin main
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects Vite settings
4. Deploy!

**Custom settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Option 2: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Import from GitHub
3. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Option 3: GitHub Pages

Add to `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/gradient-generator/', // Your repo name
  plugins: [react()],
  // ... rest of config
})
```

Add to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Install gh-pages:
```bash
npm install --save-dev gh-pages
npm run deploy
```

### Option 4: Self-Host

After `npm run build`, upload the `dist/` folder to any web server.

---

## Troubleshooting

### Import Errors

**Problem:** `Cannot find module './components/...'`

**Solution:** 
- Check file paths are correct
- Ensure files have proper extensions (.tsx)
- Update import paths from absolute to relative

### Font Issues

**Problem:** Fonts not loading

**Solution:**
1. Download Fragment Mono and General Sans fonts
2. Place in `public/fonts/`
3. Update `globals.css` with proper font-face paths

### Three.js Warnings

**Problem:** Three.js console warnings

**Solution:** These are suppressed in App.tsx, but you can remove the console override if needed

### Build Errors

**Problem:** TypeScript errors during build

**Solution:**
- Run `npm run typecheck` to see all errors
- Fix type issues or add `// @ts-ignore` as needed
- Ensure all dependencies are installed

---

## Environment-Specific Notes

### Figma Make → Standalone Differences

1. **Import paths:** Absolute → Relative
2. **Font loading:** Built-in → Manual
3. **Asset imports:** `figma:asset` → Standard imports
4. **Hot reload:** Automatic → Vite HMR

### Performance Optimizations

For production, consider:
- Code splitting for Three.js
- Lazy loading gradient components
- Service worker for offline support
- Compression (gzip/brotli)

---

## Getting Raw GitHub URLs

Once files are on GitHub, get raw URLs like this:

```
https://raw.githubusercontent.com/USERNAME/REPO/BRANCH/path/to/file.tsx
```

Example:
```
https://raw.githubusercontent.com/johndoe/gradient-generator/main/src/App.tsx
```

These URLs can be used to recreate the project in Figma Make if needed.

---

## Questions?

Common issues:
- Missing dependencies → Run `npm install`
- Import errors → Check file paths
- Build fails → Run `npm run typecheck`
- Fonts missing → Add font files to `public/fonts/`

Good luck with your deployment! 🚀
