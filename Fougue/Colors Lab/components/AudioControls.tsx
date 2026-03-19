import { useRef } from "react"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Play, Pause, Upload, Music, X } from "lucide-react"

interface AudioControlsProps {
  audioFile: File | null
  onAudioFileChange: (file: File | null) => void
  isAudioPlaying: boolean
  onAudioPlayingChange: (playing: boolean) => void
  audioDuration: number
  audioCurrentTime: number
  isAudioLoading?: boolean
}

export function AudioControls({
  audioFile,
  onAudioFileChange,
  isAudioPlaying,
  onAudioPlayingChange,
  audioDuration,
  audioCurrentTime,
  isAudioLoading = false,
}: AudioControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      onAudioFileChange(file)
    }
  }

  const handleRemoveAudio = () => {
    onAudioFileChange(null)
    onAudioPlayingChange(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full font-chivo-mono">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="bg-card border border-border rounded-md p-[20px]">
        <div className="space-y-3">
          <div className="text-xs tracking-wide text-[rgb(61,61,61)] font-header text-[16px]">
            lancer session
          </div>
          
          {audioFile && (
            <div className="flex items-center justify-between px-4 h-11 bg-secondary/50 border border-border rounded-full">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Music className="size-4 flex-shrink-0" />
                <span className="truncate text-xs">{audioFile.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAudio}
                className="flex-shrink-0 ml-2 h-7 w-7 p-0 hover:bg-background"
              >
                <X className="size-3" />
              </Button>
            </div>
          )}
          
          <div className="space-y-3">
            {!audioFile ? (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full text-xs h-11 rounded-full border-border uppercase hover:bg-[#FFD4BC]"
              >
                <Upload className="size-4 mr-2" />
                fichier audio
              </Button>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => onAudioPlayingChange(!isAudioPlaying)}
                    variant="default"
                    className="text-xs h-11 rounded-full"
                    disabled={isAudioLoading}
                  >
                    {isAudioLoading ? (
                      <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isAudioPlaying ? (
                      <>
                        <Pause className="size-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="text-xs h-11 rounded-full border-border hover:bg-[#FFD4BC]"
                  >
                    <Upload className="size-4 mr-2" />
                    changer
                  </Button>
                </div>

                {/* Audio Progress Bar */}
                <div className="space-y-1.5">
                  <Progress 
                    value={audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0} 
                    className="h-1.5"
                  />
                  <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground">
                    <span>{formatTime(audioCurrentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}