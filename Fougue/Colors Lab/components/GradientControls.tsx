import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";

interface GradientControlsProps {
  numColors: number;
  onNumColorsChange: (value: number) => void;
  animationSpeed: number;
  onAnimationSpeedChange: (value: number) => void;
  flowScale: number;
  onFlowScaleChange: (value: number) => void;
  waveIntensity: number;
  onWaveIntensityChange: (value: number) => void;
  onReset: () => void;
}

export function GradientControls({
  numColors,
  onNumColorsChange,
  animationSpeed,
  onAnimationSpeedChange,
  flowScale,
  onFlowScaleChange,
  waveIntensity,
  onWaveIntensityChange,
  onReset,
}: GradientControlsProps) {
  return (
    <div className="w-full font-chivo-mono">
      <div className="bg-card border border-border rounded-md pt-[11px] pr-[20px] pb-[24px] pl-[20px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-wide text-[rgb(61,61,61)] font-header text-[16px]">
              Moduler
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 w-8 p-0 hover:bg-transparent hover:text-[#FF9E69]"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>

          {/* Number of Colors */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#3D3D3D]">
                colorer
              </label>
              <span className="text-xs tabular-nums text-[#3D3D3D]">
                {numColors}
              </span>
            </div>
            <Slider
              min={2}
              max={6}
              step={1}
              value={[numColors]}
              onValueChange={(values) =>
                onNumColorsChange(values[0])
              }
              className="w-full"
            />
          </div>

          {/* Animation Speed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#3D3D3D]">
                vitesse
              </label>
              <span className="text-xs tabular-nums text-[#3D3D3D]">
                {animationSpeed.toFixed(1)}
              </span>
            </div>
            <Slider
              min={0.1}
              max={2.0}
              step={0.1}
              value={[animationSpeed]}
              onValueChange={(values) =>
                onAnimationSpeedChange(values[0])
              }
              className="w-full"
            />
          </div>

          {/* Flow Scale */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#3D3D3D]">
                Flux
              </label>
              <span className="text-xs tabular-nums text-[#3D3D3D]">
                {flowScale.toFixed(1)}
              </span>
            </div>
            <Slider
              min={0.5}
              max={3.0}
              step={0.1}
              value={[flowScale]}
              onValueChange={(values) =>
                onFlowScaleChange(values[0])
              }
              className="w-full"
            />
          </div>

          {/* Wave Intensity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#3D3D3D]">
                Ondes
              </label>
              <span className="text-xs tabular-nums text-[#3D3D3D]">
                {waveIntensity.toFixed(1)}
              </span>
            </div>
            <Slider
              min={0.5}
              max={4.0}
              step={0.1}
              value={[waveIntensity]}
              onValueChange={(values) =>
                onWaveIntensityChange(values[0])
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}