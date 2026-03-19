# GitHub Export Checklist

## Files to Export (Priority Order)

### 🔴 Critical Files (Required for functionality)

#### Main Application
- [ ] `/App.tsx` - Main application component and layout

#### Gradient Components (Three.js Shaders)
- [ ] `/components/GrainyGradient.tsx` - Wavy/Onirique gradient
- [ ] `/components/LinearWaveGradient.tsx` - Linear wave/Aligné gradient
- [ ] `/components/RadialGradient.tsx` - Radial gradient

#### Audio System
- [ ] `/components/AudioAnalyzer.tsx` - Web Audio API integration
- [ ] `/components/AudioControls.tsx` - Playback controls
- [ ] `/components/AudioSpectrum.tsx` - Visual spectrum display

#### Control Components
- [ ] `/components/GradientControls.tsx` - Parameter sliders
- [ ] `/components/GradientTypeControls.tsx` - Type selector
- [ ] `/components/PaletteControls.tsx` - Color palette UI
- [ ] `/components/ColorPicker.tsx` - Color picker dialog
- [ ] `/components/RandomGenerator.tsx` - Random palette logic

#### Utilities
- [ ] `/components/ErrorBoundary.tsx` - Error handling

#### Styles
- [ ] `/styles/globals.css` - All CSS including Tailwind config

---

### 🟡 Important Files (UI Components)

#### Shadcn UI Components (used by the app)
- [ ] `/components/ui/button.tsx`
- [ ] `/components/ui/slider.tsx`
- [ ] `/components/ui/card.tsx`
- [ ] `/components/ui/collapsible.tsx`
- [ ] `/components/ui/label.tsx`
- [ ] `/components/ui/popover.tsx`
- [ ] `/components/ui/utils.ts`

#### Additional UI (if used)
- [ ] `/components/ui/separator.tsx`
- [ ] `/components/ui/switch.tsx`
- [ ] `/components/ui/tooltip.tsx`

---

### 🟢 Optional Files (Assets & Documentation)

#### Logo/Branding
- [ ] `/imports/Layer1.tsx` - Main logo component
- [ ] `/imports/Group1.tsx` - Logo group
- [ ] `/imports/svg-1s4oqrbvy8.ts` - SVG path data
- [ ] `/imports/svg-xt0oxb76dx.ts` - SVG path data

#### Documentation
- [ ] `/README.md` - Project documentation
- [ ] `/EXPORT_CHECKLIST.md` - This file
- [ ] `/Attributions.md` - Credits (if exists)

---

### ⚪ Skip These Files (Not needed for GitHub)

#### Supabase (not used by the app)
- ❌ `/supabase/functions/server/index.tsx`
- ❌ `/supabase/functions/server/kv_store.tsx`
- ❌ `/utils/supabase/info.tsx`

#### Unused UI Components (unless you want full shadcn library)
- ❌ All other `/components/ui/*.tsx` files not listed above

#### Figma-Specific
- ❌ `/components/figma/ImageWithFallback.tsx` - Only needed for Figma Make

---

## Export Instructions

### Method 1: Manual Download (Recommended)
1. In Figma Make, click on each file in the checklist above
2. Copy the file contents
3. Create the same file structure in your local project
4. Paste the contents

### Method 2: Figma Make Export (if available)
Look for an export/download option in Figma Make interface.

---

## File Structure for GitHub

Create this folder structure in your repository:

```
your-repo/
├── README.md
├── EXPORT_CHECKLIST.md
├── package.json                    # You'll need to create this
├── tsconfig.json                   # You'll need to create this
├── tailwind.config.js              # Optional (using Tailwind v4)
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── GrainyGradient.tsx
│   │   ├── LinearWaveGradient.tsx
│   │   ├── RadialGradient.tsx
│   │   ├── AudioAnalyzer.tsx
│   │   ├── AudioControls.tsx
│   │   ├── AudioSpectrum.tsx
│   │   ├── GradientControls.tsx
│   │   ├── GradientTypeControls.tsx
│   │   ├── PaletteControls.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── RandomGenerator.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── slider.tsx
│   │       ├── card.tsx
│   │       ├── collapsible.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       └── utils.ts
│   ├── imports/
│   │   ├── Layer1.tsx
│   │   ├── Group1.tsx
│   │   └── svg-*.ts
│   └── styles/
│       └── globals.css
└── public/                         # For assets if needed
```

---

## Additional Files to Create

### package.json
```json
{
  "name": "gradient-generator",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.160.0",
    "lucide-react": "^0.index",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-slider": "^1.1.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/three": "^0.160.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### tsconfig.json
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

### vite.config.ts
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

---

## Post-Export Steps

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Update Import Paths:**
   - Change `/components/` to `./components/` or `@/components/`
   - Update any absolute imports to relative imports

3. **Font Setup:**
   - Download Fragment Mono and General Sans fonts
   - Add to `/public/fonts/` or use Google Fonts alternatives
   - Update font-face declarations in `globals.css`

4. **Test Locally:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## Quick Command to Count Files

When in Figma Make, these are the file counts to expect:
- **Critical files:** ~15 files
- **UI components:** ~7 files
- **Assets:** ~4 files
- **Total for export:** ~26 files

---

## Notes

- The app doesn't use any external APIs except Web Audio API (browser-native)
- No backend required
- Fully client-side application
- Works offline once loaded
