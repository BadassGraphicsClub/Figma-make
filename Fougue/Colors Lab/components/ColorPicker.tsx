import { Button } from "./ui/button"
import { Shuffle, ArrowLeftRight, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { useState } from "react"

interface ColorPickerProps {
  colors: string[]
  selectedPaletteId: 1 | 2 | 3 | 4 | 5 | 7
  onPaletteChange: (paletteId: 1 | 2 | 3 | 4 | 5 | 7) => void
  onRandomize: () => void
  audioData?: {
    bassEnergy: number
    midEnergy: number
    highEnergy: number
  } | null
  isAudioPlaying: boolean
  customColors: string[]
  showCustomPalette: boolean
  customPaletteName?: string
  reverseColors: boolean
  onReverseColorsChange: (reverse: boolean) => void
  onCustomPaletteCreate: (colors: string[]) => void
}

// Palette names
const PALETTE_NAMES = {
  1: "PM : ZÉNITH",
  2: "AM : SUBSOLAIRE",
  3: "AM : AUBE",
  4: "AM : AURORES",
  5: "PERSONNALISÉ", // This will be dynamic
  7: "PM : CRÉPUSCULE",
}

// Default palette definitions
const DEFAULT_PALETTES = {
  1: ["#ED72C9", "#FF7A40", "#6889F9", "#4767D6"],
  2: ["#58AB60", "#B8BE5D", "#FAF7D6", "#F5C5C0", "#F698D0"],
  3: ["#FF5733", "#F5C5C0", "#FABC90", "#BDD7F2"],
  4: ["#6889F9", "#FAF7D6", "#DD9BB3", "#A09CF2"],
  7: ["#C5BFDE", "#F5C5C0", "#FABC90", "#FF7A40", "#CF342B"],
}

export function ColorPicker({ 
  colors,
  selectedPaletteId, 
  onPaletteChange,
  onRandomize,
  audioData,
  isAudioPlaying,
  customColors,
  showCustomPalette,
  customPaletteName,
  reverseColors,
  onReverseColorsChange,
  onCustomPaletteCreate
}: ColorPickerProps) {
  
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  
  // Get all unique colors from all palettes
  const allColors = [
    "#4767D6", "#6889F9", "#BDD7F2",
    "#C5BFDE", "#A09CF2", "#ED72C9",
    "#F698D0", "#DD9BB3", "#F5C5C0",
    "#FABC90", "#FF7A40", "#FF5733",
    "#CF342B", "#FAF7D6", "#B8BE5D",
    "#58AB60"
  ]
  
  const handleColorClick = (color: string) => {
    if (selectedColors.includes(color)) {
      // Deselect
      setSelectedColors(selectedColors.filter(c => c !== color))
    } else {
      // Select (max 6)
      if (selectedColors.length < 6) {
        setSelectedColors([...selectedColors, color])
      }
    }
  }
  
  const handleCreateCustomPalette = () => {
    if (selectedColors.length > 0) {
      onCustomPaletteCreate(selectedColors)
    }
  }
  
  // Function to get colors with audio reactivity applied
  const getDisplayColors = (paletteId: 1 | 2 | 3 | 4 | 5 | 7) => {
    const paletteColors = paletteId === 5 ? customColors : DEFAULT_PALETTES[paletteId as 1 | 2 | 3 | 4 | 7]
    
    // If audio is playing and this is the selected palette, apply audio reactivity
    if (isAudioPlaying && audioData && paletteId === selectedPaletteId) {
      // Map frequency bands to colors (bass -> first color, mid -> middle colors, high -> last color)
      const updatedColors = paletteColors.map((color, index) => {
        const ratio = index / (paletteColors.length - 1)
        let intensity = 1.0
        
        if (ratio < 0.33) {
          // Bass-influenced colors
          intensity = 0.7 + (audioData.bassEnergy * 0.3)
        } else if (ratio < 0.66) {
          // Mid-influenced colors
          intensity = 0.7 + (audioData.midEnergy * 0.3)
        } else {
          // High-influenced colors
          intensity = 0.7 + (audioData.highEnergy * 0.3)
        }
        
        // Adjust color brightness based on intensity
        return adjustColorBrightness(color, intensity)
      })
      
      return updatedColors
    }
    
    return paletteColors
  }
  
  // Helper to adjust color brightness
  const adjustColorBrightness = (hex: string, factor: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    
    const newR = Math.min(255, Math.floor(r * factor))
    const newG = Math.min(255, Math.floor(g * factor))
    const newB = Math.min(255, Math.floor(b * factor))
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  // Get the colors for the currently selected palette
  const currentDisplayColors = getDisplayColors(selectedPaletteId)
  
  // Apply reverse if needed
  const finalDisplayColors = reverseColors ? [...currentDisplayColors].reverse() : currentDisplayColors

  return (
    <div className="space-y-3 font-chivo-mono">
      {/* Palettes Subtitle */}
      <div className="text-xs tracking-wide text-[rgb(61,61,61)] font-header text-[16px] uppercase">
        colorer
      </div>

      {/* Palette Selectors - Vertical */}
      <div className="space-y-2">
        {([4, 3, 2, 1, 7, 5] as const).map((paletteId) => {
          // Only show palette 5 (Custom) if it's active
          if (paletteId === 5 && !showCustomPalette) return null
          
          const isSelected = selectedPaletteId === paletteId
          // Use dynamic name for palette 5
          const paletteName = paletteId === 5 && customPaletteName ? customPaletteName : PALETTE_NAMES[paletteId]
          
          return (
            <button
              key={paletteId}
              onClick={() => onPaletteChange(paletteId)}
              className="flex items-center gap-2 transition-all group"
            >
              {/* Round Selector */}
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected 
                  ? 'bg-foreground border-foreground' 
                  : 'border-border group-hover:bg-[#FFD4BC]'
              }`} />
              
              {/* Palette Name */}
              <div className="text-xs uppercase">
                {paletteName}
              </div>
            </button>
          )
        })}
      </div>

      {/* Single Gradient Bar for Selected Palette */}
      <div 
        className="w-full h-6 rounded-full"
        style={{
          background: `linear-gradient(to right, ${finalDisplayColors.join(', ')})`
        }}
      />

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onReverseColorsChange(!reverseColors)}
          variant="outline"
          className="text-xs h-11 rounded-full border-border uppercase hover:bg-[#FFD4BC]"
        >
          <ArrowLeftRight className="size-4 mr-1" />
          inverser
        </Button>
        
        <Button
          onClick={onRandomize}
          variant="outline"
          className="text-xs h-11 rounded-full border-border uppercase hover:bg-[#FFD4BC]"
        >
          <Shuffle className="size-4 mr-1" />
          aléatoire
        </Button>
      </div>

      {/* Custom Color Picker Collapsible */}
      <Collapsible open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full text-xs h-11 rounded-full border-border uppercase hover:bg-[#FFD4BC] flex items-center justify-between"
          >
            <span>Personnaliser</span>
            <ChevronDown className={`size-4 transition-transform duration-200 ${isCustomOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3">
          <div className="space-y-3">
            {/* Color Grid */}
            <div className="grid grid-cols-4 gap-2">
              {allColors.map((color) => {
                const isSelected = selectedColors.includes(color)
                return (
                  <button
                    key={color}
                    onClick={() => handleColorClick(color)}
                    className={`w-full aspect-square rounded-md border transition-all ${
                      isSelected 
                        ? 'border-foreground border-[3px]' 
                        : 'border-border hover:border-foreground'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                )
              })}
            </div>
            
            {/* Selected colors count and create button */}
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-foreground/60">
                {selectedColors.length} / 6 couleurs
              </div>
              
              <Button
                onClick={handleCreateCustomPalette}
                disabled={selectedColors.length === 0}
                variant="outline"
                className="text-xs h-9 rounded-full border-border uppercase hover:bg-[#FFD4BC] disabled:opacity-50"
              >
                créer ma palette
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}