import { useEffect, useState } from 'react'

interface AudioData {
  bassEnergy: number
  midEnergy: number
  highEnergy: number
  overallAmplitude: number
  spectralComplexity: number
  animationSpeedMultiplier: number
  waveIntensityMultiplier: number
}

interface AudioSpectrumProps {
  audioData: AudioData | null
  isPlaying: boolean
}

export function AudioSpectrum({ audioData, isPlaying }: AudioSpectrumProps) {
  const [animationPhase, setAnimationPhase] = useState(0)

  // Continuous animation loop for more dynamic visuals - only when playing
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 0.1) % (Math.PI * 2))
    }, 50)
    return () => clearInterval(interval)
  }, [isPlaying])

  // Helper to render circular dial like a clock
  const renderCircularDial = (value: number, size: number = 50) => {
    // Map value (0-1) to angle (0° to 270° range, starting from top and going clockwise)
    // We'll use -135° to +135° range for a nice dial effect
    const minAngle = -135
    const maxAngle = 135
    const angle = minAngle + (value * (maxAngle - minAngle))
    
    const radius = size / 2
    const needleLength = radius - 10
    
    return (
      <div 
        className="relative flex items-center justify-center bg-foreground rounded-full" 
        style={{ width: size, height: size }}
      >
        {/* Needle/Indicator - white on black background */}
        <div
          className="absolute bg-background origin-bottom transition-transform duration-300"
          style={{
            width: '5px',
            height: `${needleLength}px`,
            bottom: '50%',
            left: '50%',
            marginLeft: '-2.5px',
            transform: `rotate(${angle}deg)`,
          }}
        />
      </div>
    )
  }

  // Enhanced wave spectrum with continuous animation
  const renderWaveSpectrum = (value: number, color: string = 'currentColor') => {
    const bars = 16
    return (
      <div className="flex gap-0.5 items-end h-12">
        {Array.from({ length: bars }).map((_, i) => {
          // Create animated wave pattern
          const phase = (i / bars) * Math.PI * 3 + animationPhase
          const waveHeight = Math.sin(phase) * 0.4 + 0.6
          const barHeight = value * waveHeight * 100
          
          // Add pulsing effect
          const pulseEffect = 1 + Math.sin(animationPhase + i * 0.3) * 0.2
          
          return (
            <div 
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{ 
                height: `${Math.max(barHeight * pulseEffect, 8)}%`,
                backgroundColor: color,
                opacity: 0.4 + (value * 0.6),
                transform: `scaleY(${0.8 + pulseEffect * 0.2})`,
                transition: 'all 0.1s ease-out'
              }}
            />
          )
        })}
      </div>
    )
  }

  // Enhanced waveform with more dynamic animation - wider for complexity and amplitude
  const renderWaveform = (value: number) => {
    const bars = 15 // Increased from 9 for wider display
    return (
      <div className="flex gap-1 items-center justify-center h-10 px-[0px] py-[6px] my-[4px] px-[12px] mx-[0px]">
        {Array.from({ length: bars }).map((_, i) => {
          const centerDistance = Math.abs(i - Math.floor(bars / 2))
          
          // Create animated wave pattern
          const waveEffect = Math.sin(animationPhase + i * 0.5) * 0.3 + 1
          const baseHeight = value * (1 - centerDistance / (bars / 2 + 1)) * 150
          const animatedHeight = baseHeight * waveEffect
          
          return (
            <div 
              key={i}
              className="bg-foreground transition-all"
              style={{ 
                width: '5px',
                height: `${Math.max(animatedHeight, 12)}%`,
                transform: `scaleY(${waveEffect})`,
                transition: 'all 0.1s ease-out'
              }}
            />
          )
        })}
      </div>
    )
  }

  const accentColor = '#FF9E69'

  return (
    <div className="w-full font-chivo-mono">
      <div 
        className="relative border border-border rounded-md px-[16px] py-[16px]"
      >
        {/* Top Left Crop Mark */}
        <div className="absolute -top-3 -left-3">
        </div>
        
        {/* Top Right Crop Mark */}
        <div className="absolute -top-3 -right-3">
        </div>
        
        
        
        {/* All 5 parameters as vertical columns spread horizontally */}
        <div className="flex justify-between items-start gap-3">
          {/* Bass Column */}
          <div className="flex flex-col items-center gap-2 flex-[1.3]">
            <div className="text-[12px] text-[rgb(61,61,61)]">Basse</div>
            {renderCircularDial(audioData?.bassEnergy || 0, 50)}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground text-center leading-tight">
              <span className="text-[rgb(61,61,61)] text-[12px]">Chaleur</span>
              <span className="tabular-nums text-[rgb(61,61,61)] text-[12px]">
                {audioData && isPlaying ? `${(audioData.bassEnergy * 100).toFixed(0).padStart(2, '0')}%` : '—'}
              </span>
            </div>
          </div>

          {/* Mid Column */}
          <div className="flex flex-col items-center gap-2 flex-[1.3]">
            <div className="text-[12px] text-[rgb(61,61,61)]">Médium</div>
            {renderCircularDial(audioData?.midEnergy || 0, 50)}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground text-center leading-tight">
              <span className="text-[rgb(61,61,61)] text-[12px]">Balance</span>
              <span className="tabular-nums text-[rgb(61,61,61)] text-[12px]">
                {audioData && isPlaying ? `${(audioData.midEnergy * 100).toFixed(0).padStart(2, '0')}%` : '—'}
              </span>
            </div>
          </div>

          {/* High Column */}
          <div className="flex flex-col items-center gap-2 flex-[1.3]">
            <div className="text-[12px] text-[rgb(61,61,61)]">Aigu</div>
            {renderCircularDial(audioData?.highEnergy || 0, 50)}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground text-center leading-tight">
              <span className="text-[rgb(61,61,61)] text-[12px]">Froideur</span>
              <span className="tabular-nums text-[rgb(61,61,61)] text-[12px]">
                {audioData && isPlaying ? `${(audioData.highEnergy * 100).toFixed(0).padStart(2, '0')}%` : '—'}
              </span>
            </div>
          </div>

          {/* Complexity and Amplitude grouped closer together */}
          <div className="flex gap-2 flex-[1.8]">
            {/* Complexity Column */}
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <div className="text-[12px] text-[rgb(61,61,61)]">Complexité</div>
              <div className="w-full max-w-[130px]">
                {renderWaveform(audioData?.spectralComplexity || 0)}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground text-center leading-tight">
                <span className="text-[rgb(61,61,61)] text-[12px]">Détail flux</span>
                <span className="tabular-nums text-[rgb(61,61,61)] text-[12px]">
                  {audioData && isPlaying ? `${(audioData.spectralComplexity * 100).toFixed(0).padStart(2, '0')}%` : '—'}
                </span>
              </div>
            </div>

            {/* Amplitude Column */}
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <div className="text-[12px] text-[rgb(61,61,61)]">Amplitude</div>
              <div className="w-full max-w-[130px]">
                {renderWaveform(audioData?.overallAmplitude || 0)}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground text-center leading-tight">
                <span className="text-[rgb(61,61,61)] text-[12px]">Ondes</span>
                <span className="tabular-nums text-[rgb(61,61,61)] text-[12px]">
                  {audioData && isPlaying ? `${(audioData.overallAmplitude * 100).toFixed(0).padStart(2, '0')}%` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
