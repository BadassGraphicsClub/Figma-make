# Gradient Generator

A React-based audio-reactive gradient generator with Three.js shaders, built with a technical minimalist aesthetic.

## Features

- **Three Gradient Types:**
  - Wavy (Onirique) - Organic flowing gradients
  - Linear Wave (Aligné) - Horizontal wave-based gradients
  - Radial - Radial gradient patterns

- **Audio Reactivity:**
  - Upload audio files to drive gradient animations
  - Real-time frequency analysis (bass, mid, high)
  - Spectral complexity visualization
  - Beat detection

- **Customization:**
  - 5 preset palettes + custom palette support
  - Color reversal
  - Adjustable animation speed, flow scale, and wave intensity
  - Venetian blinds strip effect
  - Grain/noise overlay

- **Technical Stack:**
  - React 19
  - Three.js (direct usage, no @react-three/fiber)
  - TypeScript
  - Tailwind CSS v4
  - Fragment Mono Regular font (body text)
  - General Sans Semibold font (headers)

## Project Structure

```
/
├── App.tsx                          # Main application component
├── components/
│   ├── AudioAnalyzer.tsx            # Web Audio API frequency analysis
│   ├── AudioControls.tsx            # Audio playback controls
│   ├── AudioSpectrum.tsx            # Visual spectrum display
│   ├── ColorPicker.tsx              # Color selection component
│   ├── ErrorBoundary.tsx            # React error boundary
│   ├── GradientControls.tsx         # Gradient parameter controls
│   ├── GradientTypeControls.tsx     # Gradient type selector
│   ├── GrainyGradient.tsx           # Wavy gradient shader component
│   ├── LinearWaveGradient.tsx       # Linear wave shader component
│   ├── RadialGradient.tsx           # Radial gradient shader component
│   ├── PaletteControls.tsx          # Color palette selector
│   ├── RandomGenerator.tsx          # Random palette generator
│   └── ui/                          # Shadcn UI components
├── imports/
│   ├── Layer1.tsx                   # Logo component
│   ├── Group1.tsx                   # Logo group
│   └── svg-*.ts                     # SVG path data
├── styles/
│   └── globals.css                  # Global styles and CSS tokens
└── README.md                        # This file
```

## Core Files for GitHub

### Essential Application Files
- `App.tsx` - Main app logic and layout
- `components/GrainyGradient.tsx` - Wavy gradient with Three.js
- `components/LinearWaveGradient.tsx` - Linear wave gradient
- `components/RadialGradient.tsx` - Radial gradient
- `components/AudioAnalyzer.tsx` - Audio processing
- `components/AudioControls.tsx` - Audio UI
- `components/AudioSpectrum.tsx` - Spectrum visualization
- `components/PaletteControls.tsx` - Palette UI
- `components/GradientControls.tsx` - Parameter controls
- `components/GradientTypeControls.tsx` - Type selector
- `components/ColorPicker.tsx` - Color picker
- `components/RandomGenerator.tsx` - Random palette logic
- `components/ErrorBoundary.tsx` - Error handling

### UI Components (Shadcn)
- `components/ui/button.tsx`
- `components/ui/slider.tsx`
- `components/ui/card.tsx`
- `components/ui/collapsible.tsx`
- `components/ui/label.tsx`
- `components/ui/popover.tsx`
- `components/ui/utils.ts`

### Styles
- `styles/globals.css` - Tailwind config and custom CSS

### Logo/Assets
- `imports/Layer1.tsx`
- `imports/Group1.tsx`
- `imports/svg-1s4oqrbvy8.ts`
- `imports/svg-xt0oxb76dx.ts`

## Key Implementation Details

### Three.js Integration (React 19 Compatible)

The gradient components use **Three.js directly** instead of @react-three/fiber to ensure React 19 compatibility:

```typescript
// Each gradient component manages its own Three.js renderer
const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
const sceneRef = useRef<THREE.Scene | null>(null)
const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
const meshRef = useRef<THREE.Mesh | null>(null)
const startTimeRef = useRef(performance.now())

// Direct WebGL renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000, 1)

// Shader material with custom uniforms
const material = new THREE.ShaderMaterial({
  fragmentShader,
  vertexShader,
  uniforms,
})
```

### Audio Analysis

Uses Web Audio API for real-time frequency analysis:
- FFT-based frequency bins for bass, mid, and high frequencies
- RMS amplitude calculation
- Spectral complexity via spectral centroid
- Beat detection for rhythm-based effects

### Responsive Design

- Desktop: Side panel controls + large gradient display
- Mobile: Collapsible sections + vertical layout

### French Localization

UI labels are in French:
- "incarner" (embody) - Gradient type
- "colorer" (color) - Palette controls
- "moduler" (modulate) - Parameter controls

## Development Notes

### React 19 Compatibility Fix

Original issue: `@react-three/fiber` has reconciler compatibility issues with React 19.

**Solution:** Removed @react-three/fiber dependency and used Three.js directly with React hooks:
- Direct WebGLRenderer management
- useRef for Three.js objects
- useEffect for setup/cleanup
- requestAnimationFrame for render loop

### Clock Deprecation Fix

Replaced deprecated `THREE.Clock` with `performance.now()`:
```typescript
const startTimeRef = useRef(performance.now())
const elapsedTime = (performance.now() - startTimeRef.current) / 1000
```

### Gradient Type Defaults

Each gradient type has default parameters:
```typescript
const GRADIENT_TYPE_DEFAULTS = {
  wavy: { animationSpeed: 0.6, flowScale: 1.8, waveIntensity: 1.2 },
  "linear-wave": { animationSpeed: 0.5, flowScale: 1.6, waveIntensity: 1.5 },
  radial: { animationSpeed: 0.6, flowScale: 1.8, waveIntensity: 1.2 }
}
```

## Package Dependencies

Key dependencies (install via npm/yarn):
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "three": "^0.160.0",
  "lucide-react": "latest",
  "tailwindcss": "^4.0.0"
}
```

## Figma Make Specific

This project was built in **Figma Make** and uses some Figma-specific features:

### Virtual Module Imports
The original uses `figma:asset` for raster images (not used in current version).

### Font Loading
Fonts are loaded via Figma Make's font system:
- Fragment Mono Regular
- General Sans Semibold

For GitHub/standalone deployment, you'll need to:
1. Host fonts separately or use Google Fonts alternatives
2. Update font references in `globals.css`

## License

This project structure and code are provided as-is for educational purposes.
