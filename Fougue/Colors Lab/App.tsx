import { useState, useRef, useEffect } from "react";
import GrainyGradient, {
  GrainyGradientRef,
} from "./components/GrainyGradient";
import LinearWaveGradient, {
  LinearWaveGradientRef,
} from "./components/LinearWaveGradient";
import { AudioControls } from "./components/AudioControls";
import { PaletteControls } from "./components/PaletteControls";
import { GradientControls } from "./components/GradientControls";
import { GradientTypeControls, GradientType } from "./components/GradientTypeControls";
import { AudioAnalyzer, AudioData } from "./components/AudioAnalyzer";
import { AudioSpectrum } from "./components/AudioSpectrum";
import { generateRandomSettings } from "./components/RandomGenerator";
import Layer1 from "./imports/Layer1";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Suppress Three.js multiple instances warning
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = String(args[0] || '');
  if (
    message.includes('Multiple instances of Three.js') ||
    message.includes('THREE.WebGLRenderer') ||
    message.includes('three')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = String(args[0] || '');
  if (
    message.includes('Multiple instances of Three.js') ||
    message.includes('THREE.WebGLRenderer') ||
    message.includes('three')
  ) {
    return;
  }
  originalError.apply(console, args);
};

// Default palette definitions
const DEFAULT_PALETTES = {
  1: ["#ED72C9", "#FF7A40", "#6889F9", "#4767D6"],
  2: ["#58AB60", "#B8BE5D", "#FAF7D6", "#F5C5C0", "#F698D0"],
  3: ["#FF5733", "#F5C5C0", "#FABC90", "#BDD7F2"],
  4: ["#6889F9", "#FAF7D6", "#DD9BB3", "#A09CF2"],
  5: ["#FF5733", "#F5C5C0", "#FABC90"], // Custom palette - initial colors
  7: ["#C5BFDE", "#F5C5C0", "#FABC90", "#FF7A40", "#CF342B"], // PM : Sunset palette
};

// Default parameters for each gradient type
const GRADIENT_TYPE_DEFAULTS = {
  wavy: { // onirique
    animationSpeed: 0.6,
    flowScale: 1.8,
    waveIntensity: 1.2
  },
  "linear-wave": { // aligné
    animationSpeed: 0.5,
    flowScale: 1.6,
    waveIntensity: 1.5
  },
  radial: { // radial
    animationSpeed: 0.6,
    flowScale: 1.8,
    waveIntensity: 1.2
  }
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const gradientRef = useRef<GrainyGradientRef>(null);

  // Gradient type state
  const [gradientType, setGradientType] = useState<GradientType>("wavy");

  // Palette state
  const [selectedPaletteId, setSelectedPaletteId] = useState<1 | 2 | 3 | 4 | 5 | 7>(1);
  const [palettes, setPalettes] = useState(DEFAULT_PALETTES);
  const [isCustomPaletteActive, setIsCustomPaletteActive] = useState(false);
  const [customPaletteName, setCustomPaletteName] = useState<string>("PERSONNALISÉ");
  const [reverseColors, setReverseColors] = useState(false);
  const colors = palettes[selectedPaletteId];
  
  // Get colors with reverse applied if needed
  const getDisplayColors = (count: number) => {
    const selectedColors = colors.slice(0, count);
    return reverseColors ? [...selectedColors].reverse() : selectedColors;
  };
  
  // Audio state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  // Gradient settings
  const [numColors, setNumColors] = useState(6);
  const [animationSpeed, setAnimationSpeed] = useState(0.6);
  const [flowScale, setFlowScale] = useState(1.8);
  const [waveIntensity, setWaveIntensity] = useState(1.2);
  
  // Venetian blinds effect toggle
  const [venetianBlindsEnabled, setVenetianBlindsEnabled] = useState(false);

  const handlePaletteChange = (paletteId: 1 | 2 | 3 | 4 | 5 | 7) => {
    setSelectedPaletteId(paletteId);
    // Update numColors to match the palette's color count
    const paletteColors = palettes[paletteId];
    setNumColors(paletteColors.length);
    // Auto-invert "AM : Aube" palette (palette 3) by default
    if (paletteId === 3) {
      setReverseColors(true);
    }
  };

  const handleColorsChange = (newColors: string[]) => {
    setPalettes(prev => ({
      ...prev,
      [selectedPaletteId]: newColors
    }));
  };

  const handleResetPalette = () => {
    // For custom palette, reset to the first 3 colors from palette 1
    if (selectedPaletteId === 5) {
      setPalettes(prev => ({
        ...prev,
        5: DEFAULT_PALETTES[5]
      }));
    } else {
      setPalettes(prev => ({
        ...prev,
        [selectedPaletteId]: DEFAULT_PALETTES[selectedPaletteId]
      }));
    }
  };

  const handleRandomize = () => {
    const randomSettings = generateRandomSettings();
    // Show custom palette, switch to it, and set the randomized colors
    setIsCustomPaletteActive(true);
    setCustomPaletteName("ALÉATOIRE");
    setSelectedPaletteId(5);
    setPalettes(prev => ({
      ...prev,
      5: randomSettings.colors
    }));
  };

  const handleCustomPaletteCreate = (colors: string[]) => {
    // Set the custom palette with selected colors
    setIsCustomPaletteActive(true);
    setCustomPaletteName("PERSONNALISÉ");
    setSelectedPaletteId(5);
    setPalettes(prev => ({
      ...prev,
      5: colors
    }));
    setNumColors(colors.length);
  };

  const handleGradientReset = () => {
    // Reset to the current gradient type's defaults
    const defaults = GRADIENT_TYPE_DEFAULTS[gradientType];
    setNumColors(palettes[selectedPaletteId].length);
    setAnimationSpeed(defaults.animationSpeed);
    setFlowScale(defaults.flowScale);
    setWaveIntensity(defaults.waveIntensity);
  };

  // Update parameters when gradient type changes
  useEffect(() => {
    const defaults = GRADIENT_TYPE_DEFAULTS[gradientType];
    setAnimationSpeed(defaults.animationSpeed);
    setFlowScale(defaults.flowScale);
    setWaveIntensity(defaults.waveIntensity);
  }, [gradientType]);

  return (
    <div className="h-screen bg-background pt-6 px-6 pb-6 flex flex-col">
      <div className="flex-1 flex flex-col w-full min-h-0">
        <div className="flex flex-col lg:flex-row lg:items-stretch flex-1 min-h-0">
          {/* Control Panel */}
          <div className="lg:w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto overflow-x-hidden lg:pr-4 lg:pl-2" style={{ scrollbarGutter: 'stable' }}>
            {/* Logo */}
            <div className="w-full flex-shrink-0">
              <Layer1 />
            </div>
            
            {/* Mobile Gradient Display - only visible on mobile */}
            <div className="lg:hidden w-full flex-shrink-0">
              <div className="h-[400px] border border-border rounded-md overflow-hidden relative">
                {/* Top Left Crop Mark (+ sign) */}
                <div className="absolute -top-3 -left-3">
                  <div className="relative w-4 h-4">
                    <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-foreground -translate-x-1/2"></div>
                    <div className="absolute left-0 top-1/2 w-full h-[1px] border-t border-foreground -translate-y-1/2"></div>
                  </div>
                </div>
                
                {/* Top Right Crop Mark (+ sign) */}
                <div className="absolute -top-3 -right-3">
                  <div className="relative w-4 h-4">
                    <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-foreground -translate-x-1/2"></div>
                    <div className="absolute left-0 top-1/2 w-full h-[1px] border-t border-foreground -translate-y-1/2"></div>
                  </div>
                </div>
                
                {/* Bottom Left Crop Mark (+ sign) */}
                <div className="absolute -bottom-3 -left-3">
                  <div className="relative w-4 h-4">
                    <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-foreground -translate-x-1/2"></div>
                    <div className="absolute left-0 top-1/2 w-full h-[1px] border-t border-foreground -translate-y-1/2"></div>
                  </div>
                </div>
                
                {/* Bottom Right Crop Mark (+ sign) */}
                <div className="absolute -bottom-3 -right-3">
                  <div className="relative w-4 h-4">
                    <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-foreground -translate-x-1/2"></div>
                    <div className="absolute left-0 top-1/2 w-full h-[1px] border-t border-foreground -translate-y-1/2"></div>
                  </div>
                </div>
                
                <div className="w-full h-full bg-black relative">
                  {gradientType === "wavy" ? (
                    <GrainyGradient
                      colors={getDisplayColors(numColors)}
                      paletteId={selectedPaletteId}
                      audioData={audioData ? {
                        bassEnergy: audioData.bassEnergy,
                        midEnergy: audioData.midEnergy,
                        highEnergy: audioData.highEnergy,
                        overallAmplitude: audioData.overallAmplitude,
                        spectralComplexity: audioData.spectralComplexity,
                        animationSpeedMultiplier: audioData.animationSpeedMultiplier,
                        waveIntensityMultiplier: audioData.waveIntensityMultiplier
                      } : undefined}
                      animationSpeed={animationSpeed}
                      flowScale={flowScale}
                      waveIntensity={waveIntensity}
                      stripEffect={venetianBlindsEnabled}
                    />
                  ) : (
                    <LinearWaveGradient
                      colors={getDisplayColors(numColors)}
                      paletteId={selectedPaletteId}
                      audioData={audioData ? {
                        bassEnergy: audioData.bassEnergy,
                        midEnergy: audioData.midEnergy,
                        highEnergy: audioData.highEnergy,
                        overallAmplitude: audioData.overallAmplitude,
                        spectralComplexity: audioData.spectralComplexity,
                        animationSpeedMultiplier: audioData.animationSpeedMultiplier,
                        waveIntensityMultiplier: audioData.waveIntensityMultiplier,
                        beatEnergy: audioData.beatEnergy
                      } : undefined}
                      animationSpeed={animationSpeed}
                      flowScale={flowScale}
                      waveIntensity={waveIntensity}
                      stripEffect={venetianBlindsEnabled}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Audio Controls */}
            <div className="w-full flex-shrink-0">
              <AudioControls
                audioFile={audioFile}
                onAudioFileChange={setAudioFile}
                isAudioPlaying={isAudioPlaying}
                onAudioPlayingChange={setIsAudioPlaying}
                audioDuration={audioDuration}
                audioCurrentTime={audioCurrentTime}
                isAudioLoading={isAudioLoading}
              />
            </div>
            
            {/* Gradient Type Controls - Desktop: always visible, Mobile: collapsible */}
            <div className="w-full flex-shrink-0">
              {/* Desktop version */}
              <div className="hidden lg:block">
                <GradientTypeControls
                  selectedType={gradientType}
                  onTypeChange={setGradientType}
                  venetianBlindsEnabled={venetianBlindsEnabled}
                  onVenetianBlindsChange={setVenetianBlindsEnabled}
                />
              </div>
              
              {/* Mobile collapsible version */}
              <Collapsible defaultOpen={false} className="lg:hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="bg-card border border-border rounded-md p-[20px] flex items-center justify-between font-chivo-mono">
                    <span className="text-xs tracking-wide text-[rgb(61,61,61)] font-header text-[16px]">
                      incarner
                    </span>
                    <ChevronDown className="size-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <GradientTypeControls
                    selectedType={gradientType}
                    onTypeChange={setGradientType}
                    venetianBlindsEnabled={venetianBlindsEnabled}
                    onVenetianBlindsChange={setVenetianBlindsEnabled}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            {/* Palette Controls - Desktop: always visible, Mobile: collapsible */}
            <div className="w-full">
              {/* Desktop version */}
              <div className="hidden lg:block">
                <PaletteControls
                  colors={colors}
                  selectedPaletteId={selectedPaletteId}
                  onPaletteChange={handlePaletteChange}
                  onRandomize={handleRandomize}
                  isCustomPaletteActive={isCustomPaletteActive}
                  customPaletteName={customPaletteName}
                  audioData={audioData}
                  isAudioPlaying={isAudioPlaying}
                  reverseColors={reverseColors}
                  onReverseColorsChange={setReverseColors}
                  onCustomPaletteCreate={handleCustomPaletteCreate}
                />
              </div>
              
              {/* Mobile collapsible version */}
              <Collapsible defaultOpen={false} className="lg:hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="bg-card border border-border rounded-md p-[20px] flex items-center justify-between font-chivo-mono">
                    <span className="text-xs tracking-wide text-[rgb(61,61,61)] font-header text-[16px]">
                      colorer
                    </span>
                    <ChevronDown className="size-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <PaletteControls
                    colors={colors}
                    selectedPaletteId={selectedPaletteId}
                    onPaletteChange={handlePaletteChange}
                    onRandomize={handleRandomize}
                    isCustomPaletteActive={isCustomPaletteActive}
                    customPaletteName={customPaletteName}
                    audioData={audioData}
                    isAudioPlaying={isAudioPlaying}
                    reverseColors={reverseColors}
                    onReverseColorsChange={setReverseColors}
                    onCustomPaletteCreate={handleCustomPaletteCreate}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            {/* Gradient Controls - Desktop: always visible, Mobile: collapsible */}
            <div className="w-full">
              {/* Desktop version */}
              <div className="hidden lg:block">
                <GradientControls
                  numColors={numColors}
                  onNumColorsChange={setNumColors}
                  animationSpeed={animationSpeed}
                  onAnimationSpeedChange={setAnimationSpeed}
                  flowScale={flowScale}
                  onFlowScaleChange={setFlowScale}
                  waveIntensity={waveIntensity}
                  onWaveIntensityChange={setWaveIntensity}
                  onReset={handleGradientReset}
                />
              </div>
              
              {/* Mobile collapsible version */}
              <Collapsible defaultOpen={false} className="lg:hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="bg-card border border-border rounded-md p-[20px] flex items-center justify-between font-chivo-mono">
                    <span className="text-xs tracking-wide text-[rgb(61,61,61)] font-header text-[16px]">
                      moduler
                    </span>
                    <ChevronDown className="size-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <GradientControls
                    numColors={numColors}
                    onNumColorsChange={setNumColors}
                    animationSpeed={animationSpeed}
                    onAnimationSpeedChange={setAnimationSpeed}
                    flowScale={flowScale}
                    onFlowScaleChange={setFlowScale}
                    waveIntensity={waveIntensity}
                    onWaveIntensityChange={setWaveIntensity}
                    onReset={handleGradientReset}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Gradient Panel - only visible on desktop */}
          <div className="hidden lg:flex flex-1 flex-col gap-4 min-w-0 min-h-0 overflow-hidden lg:pl-2">
            {/* Gradient Display with Crop Marks */}
            <div className="flex-1 min-h-0 border border-border rounded-md overflow-hidden relative">
              {/* Top Left Crop Mark (+ sign) */}
              <div className="absolute -top-3 -left-3">
                <div className="relative w-4 h-4">
                  <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-foreground -translate-x-1/2"></div>
                  <div className="absolute left-0 top-1/2 w-full h-[1px] border-t border-foreground -translate-y-1/2"></div>
                </div>
              </div>
              
              {/* Top Right Crop Mark (+ sign) */}
              <div className="absolute -top-3 -right-3">
                <div className="relative w-4 h-4">
                  <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-foreground -translate-x-1/2"></div>
                  <div className="absolute left-0 top-1/2 w-full h-[1px] border-t border-foreground -translate-y-1/2"></div>
                </div>
              </div>
              
              {/* Bottom Left Crop Mark (+ sign) */}
              <div className="absolute -bottom-3 -left-3">
                <div className="relative w-4 h-4">
                  <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-foreground -translate-x-1/2"></div>
                  <div className="absolute left-0 top-1/2 w-full h-[1px] border-t border-foreground -translate-y-1/2"></div>
                </div>
              </div>
              
              {/* Bottom Right Crop Mark (+ sign) */}
              <div className="absolute -bottom-3 -right-3">
                <div className="relative w-4 h-4">
                  <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-foreground -translate-x-1/2"></div>
                  <div className="absolute left-0 top-1/2 w-full h-[1px] border-t border-foreground -translate-y-1/2"></div>
                </div>
              </div>
              
              <div className="w-full h-full bg-black relative">
                {gradientType === "wavy" ? (
                  <GrainyGradient
                    ref={gradientRef as React.RefObject<GrainyGradientRef>}
                    colors={getDisplayColors(numColors)}
                    paletteId={selectedPaletteId}
                    audioData={audioData ? {
                      bassEnergy: audioData.bassEnergy,
                      midEnergy: audioData.midEnergy,
                      highEnergy: audioData.highEnergy,
                      overallAmplitude: audioData.overallAmplitude,
                      spectralComplexity: audioData.spectralComplexity,
                      animationSpeedMultiplier: audioData.animationSpeedMultiplier,
                      waveIntensityMultiplier: audioData.waveIntensityMultiplier
                    } : undefined}
                    animationSpeed={animationSpeed}
                    flowScale={flowScale}
                    waveIntensity={waveIntensity}
                    stripEffect={venetianBlindsEnabled}
                  />
                ) : (
                  <LinearWaveGradient
                    ref={gradientRef as React.RefObject<LinearWaveGradientRef>}
                    colors={getDisplayColors(numColors)}
                    paletteId={selectedPaletteId}
                    audioData={audioData ? {
                      bassEnergy: audioData.bassEnergy,
                      midEnergy: audioData.midEnergy,
                      highEnergy: audioData.highEnergy,
                      overallAmplitude: audioData.overallAmplitude,
                      spectralComplexity: audioData.spectralComplexity,
                      animationSpeedMultiplier: audioData.animationSpeedMultiplier,
                      waveIntensityMultiplier: audioData.waveIntensityMultiplier,
                      beatEnergy: audioData.beatEnergy
                    } : undefined}
                    animationSpeed={animationSpeed}
                    flowScale={flowScale}
                    waveIntensity={waveIntensity}
                    stripEffect={venetianBlindsEnabled}
                  />
                )}
              </div>
            </div>

            {/* Audio Spectrum Analysis */}
            <div className="flex-shrink-0">
              <AudioSpectrum 
                audioData={audioData}
                isPlaying={isAudioPlaying}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Audio Analyzer */}
      {audioFile && (
        <AudioAnalyzer
          audioFile={audioFile}
          onAudioData={setAudioData}
          onDuration={setAudioDuration}
          onCurrentTime={setAudioCurrentTime}
          isPlaying={isAudioPlaying}
          onPlayingChange={setIsAudioPlaying}
          onLoadingChange={setIsAudioLoading}
        />
      )}
    </div>
  );
}