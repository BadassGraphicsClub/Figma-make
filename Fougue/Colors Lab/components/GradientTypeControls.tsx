import { Button } from "./ui/button"

export type GradientType = "wavy" | "radial" | "linear-wave"

interface GradientTypeControlsProps {
  selectedType: GradientType
  onTypeChange: (type: GradientType) => void
  venetianBlindsEnabled: boolean
  onVenetianBlindsChange: (enabled: boolean) => void
}

export function GradientTypeControls({ 
  selectedType, 
  onTypeChange,
  venetianBlindsEnabled,
  onVenetianBlindsChange
}: GradientTypeControlsProps) {
  return (
    <div className="w-full">
      <div className="bg-card border border-border rounded-md p-[20px]">
        <div className="space-y-3">
          <div className="text-foreground font-header text-[rgb(61,61,61)]">incarner</div>
          
          <div className="flex flex-col gap-2">
            <Button
              variant={selectedType === "wavy" ? "default" : "outline"}
              onClick={() => onTypeChange("wavy")}
              className={`w-full text-[12px] rounded-[186px] ${selectedType === "wavy" ? "" : "hover:bg-[#FFD4BC]"}`}
            >
              intangible
            </Button>
            
            <Button
              variant={selectedType === "radial" ? "default" : "outline"}
              onClick={() => onTypeChange("radial")}
              className={`w-full text-[12px] rounded-[307px] ${selectedType === "radial" ? "" : "hover:bg-[#FFD4BC]"}`}
            >
              introspectif
            </Button>
            
            <Button
              variant={selectedType === "linear-wave" ? "default" : "outline"}
              onClick={() => onTypeChange("linear-wave")}
              className={`w-full text-[12px] rounded-[230px] ${selectedType === "linear-wave" ? "" : "hover:bg-[#FFD4BC]"}`}
            >
              aligné
            </Button>

            {/* Venetian Blinds Toggle */}
            <div className="pt-[2px] mt-2 pr-[0px] pb-[0px] pl-[0px] p-[0px]">
              <div className="mb-2 text-[12px] text-[rgb(61,61,61)] uppercase">Bandes de fréquences</div>
              <div className="flex bg-card border border-border rounded-full p-1 relative">
                {/* Sliding background */}
                <div 
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-foreground rounded-full transition-transform duration-300 ease-in-out ${
                    venetianBlindsEnabled ? 'translate-x-full' : 'translate-x-0'
                  }`}
                />
                
                <button
                  onClick={() => onVenetianBlindsChange(false)}
                  className={`flex-1 text-[12px] rounded-full py-2 px-4 transition-colors duration-300 uppercase relative z-10 ${
                    !venetianBlindsEnabled 
                      ? 'text-background' 
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  Off
                </button>
                <button
                  onClick={() => onVenetianBlindsChange(true)}
                  className={`flex-1 text-[12px] rounded-full py-2 px-4 transition-colors duration-300 uppercase relative z-10 ${
                    venetianBlindsEnabled 
                      ? 'text-background' 
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  On
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
