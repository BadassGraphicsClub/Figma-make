import { ColorPicker } from "./ColorPicker"

interface AudioData {
  bassEnergy: number
  midEnergy: number
  highEnergy: number
  overallAmplitude: number
  spectralComplexity: number
  animationSpeedMultiplier: number
  waveIntensityMultiplier: number
}

interface PaletteControlsProps {
  colors: string[]
  selectedPaletteId: 1 | 2 | 3 | 4 | 5 | 7
  onPaletteChange: (paletteId: 1 | 2 | 3 | 4 | 5 | 7) => void
  onRandomize: () => void
  isCustomPaletteActive: boolean
  customPaletteName?: string
  audioData?: AudioData | null
  isAudioPlaying: boolean
  reverseColors: boolean
  onReverseColorsChange: (reverse: boolean) => void
  onCustomPaletteCreate: (colors: string[]) => void
}

export function PaletteControls({
  colors,
  selectedPaletteId,
  onPaletteChange,
  onRandomize,
  isCustomPaletteActive,
  customPaletteName,
  audioData,
  isAudioPlaying,
  reverseColors,
  onReverseColorsChange,
  onCustomPaletteCreate,
}: PaletteControlsProps) {
  return (
    <div className="w-full font-chivo-mono">
      <div className="bg-card border border-border rounded-md p-[20px]">
        <ColorPicker 
          colors={colors}
          selectedPaletteId={selectedPaletteId}
          onPaletteChange={onPaletteChange}
          onRandomize={onRandomize}
          audioData={audioData ? {
            bassEnergy: audioData.bassEnergy,
            midEnergy: audioData.midEnergy,
            highEnergy: audioData.highEnergy
          } : null}
          isAudioPlaying={isAudioPlaying}
          customColors={colors}
          showCustomPalette={isCustomPaletteActive}
          customPaletteName={customPaletteName}
          reverseColors={reverseColors}
          onReverseColorsChange={onReverseColorsChange}
          onCustomPaletteCreate={onCustomPaletteCreate}
        />
      </div>
    </div>
  )
}