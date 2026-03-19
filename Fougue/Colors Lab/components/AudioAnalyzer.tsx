import { useEffect, useRef, useState } from "react";

export interface AudioData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  bassEnergy: number;
  midEnergy: number;
  highEnergy: number;
  overallAmplitude: number;
  spectralComplexity: number;
  animationSpeedMultiplier: number; // From speed ramp
  waveIntensityMultiplier: number; // From pitch ramp (2x-3x)
  beatEnergy: number; // Detects rhythmic onsets/beats
  isPlaying: boolean;
}

interface AudioAnalyzerProps {
  audioFile: File | null;
  onAudioData: (data: AudioData) => void;
  onDuration: (duration: number) => void;
  onCurrentTime?: (time: number) => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function AudioAnalyzer({
  audioFile,
  onAudioData,
  onDuration,
  onCurrentTime,
  isPlaying,
  onPlayingChange,
  onLoadingChange,
}: AudioAnalyzerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  
  // Ramps for animation speed and wave intensity
  const speedRampRef = useRef<Float32Array | null>(null);
  const pitchRampRef = useRef<Float32Array | null>(null);
  
  // Beat detection state
  const beatEnergyHistoryRef = useRef<number[]>(Array(30).fill(0)); // Track energy history for beat detection

  useEffect(() => {
    if (!audioFile) {
      // Clear loading state when no file
      if (onLoadingChange) {
        onLoadingChange(false);
      }
      return;
    }

    const loadAudio = async () => {
      // Set loading state
      if (onLoadingChange) {
        onLoadingChange(true);
      }
      
      // Reset pause time when loading new audio
      pauseTimeRef.current = 0;
      
      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create analyser
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Load audio file
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;

      onDuration(audioBuffer.duration);
      
      // Analyze the full audio to create ramps
      analyzeFullAudio(audioBuffer, audioContext.sampleRate);
      
      // Audio is now ready to play
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    };

    loadAudio().catch((error) => {
      console.error("Error loading audio:", error);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioFile, onDuration, onLoadingChange]);
  
  // Analyze full audio file to create animation speed and pitch ramps
  const analyzeFullAudio = (audioBuffer: AudioBuffer, sampleRate: number) => {
    const duration = audioBuffer.duration;
    const samplesPerSecond = 2; // 2 samples per second for smooth but responsive changes
    const totalSamples = Math.ceil(duration * samplesPerSecond);
    
    const rawSpeedRamp = new Float32Array(totalSamples);
    const rawPitchRamp = new Float32Array(totalSamples);
    
    const channelData = audioBuffer.getChannelData(0);
    const fftSize = 2048;
    const hopSize = Math.floor(sampleRate / samplesPerSecond);
    
    for (let i = 0; i < totalSamples; i++) {
      const startSample = i * hopSize;
      const endSample = Math.min(startSample + fftSize, channelData.length);
      
      if (startSample >= channelData.length) break;
      
      // Extract window of samples
      const windowData = channelData.slice(startSample, endSample);
      
      // Calculate RMS energy
      let totalEnergy = 0;
      for (let j = 0; j < windowData.length; j++) {
        const energy = windowData[j] * windowData[j];
        totalEnergy += energy;
      }
      
      const rms = Math.sqrt(totalEnergy / windowData.length);
      
      // Estimate spectral centroid (simplified pitch/brightness measure)
      let weightedSum = 0;
      let magnitudeSum = 0;
      
      for (let j = 0; j < Math.min(windowData.length, fftSize / 2); j++) {
        const magnitude = Math.abs(windowData[j]);
        const frequency = (j * sampleRate) / fftSize;
        
        weightedSum += frequency * magnitude;
        magnitudeSum += magnitude;
      }
      
      const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
      
      // Animation speed ramp based on overall energy (RMS amplitude)
      // Higher energy = faster animation (range 0.6x to 2.5x - wide dynamic range)
      const normalizedEnergy = Math.min(rms * 10, 1.0); // Normalize to 0-1
      rawSpeedRamp[i] = 0.6 + (normalizedEnergy * 1.9);
      
      // Wave intensity/pitch ramp based on spectral centroid
      // Higher frequencies = higher wave intensity (range 2.0x to 3.0x)
      const normalizedPitch = Math.min(spectralCentroid / 4000, 1.0); // Normalize to 0-1
      rawPitchRamp[i] = 2.0 + (normalizedPitch * 1.0);
    }
    
    // Apply moderate smoothing (3 passes for smooth but dynamic response)
    speedRampRef.current = smoothRamp(smoothRamp(smoothRamp(rawSpeedRamp)));
    pitchRampRef.current = smoothRamp(smoothRamp(smoothRamp(rawPitchRamp)));
  };
  
  // Multi-pass smoothing function to eliminate discontinuities
  const smoothRamp = (ramp: Float32Array): Float32Array => {
    const smoothed = new Float32Array(ramp.length);
    const windowSize = 4; // 4-sample window for dynamic but smooth transitions
    
    for (let i = 0; i < ramp.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = -Math.floor(windowSize / 2); j <= Math.floor(windowSize / 2); j++) {
        const index = i + j;
        if (index >= 0 && index < ramp.length) {
          sum += ramp[index];
          count++;
        }
      }
      
      smoothed[i] = sum / count;
    }
    
    return smoothed;
  };

  useEffect(() => {
    if (!audioContextRef.current || !analyserRef.current || !audioBufferRef.current) return;

    if (isPlaying) {
      // Create and start source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      // Ensure offset is valid (non-negative and within audio duration)
      const offset = Math.max(0, Math.min(pauseTimeRef.current, audioBufferRef.current.duration));
      source.start(0, offset);
      startTimeRef.current = audioContextRef.current.currentTime - offset;
      sourceRef.current = source;

      // Stop when audio ends
      source.onended = () => {
        onPlayingChange(false);
        pauseTimeRef.current = 0;
      };

      // Start analysis loop
      const analyze = () => {
        if (!analyserRef.current) return;

        const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
        const timeDomainData = new Uint8Array(analyserRef.current.frequencyBinCount);

        analyserRef.current.getByteFrequencyData(frequencyData);
        analyserRef.current.getByteTimeDomainData(timeDomainData);

        // Calculate energy in different frequency ranges
        const bassRange = Math.floor(frequencyData.length * 0.1);
        const midRange = Math.floor(frequencyData.length * 0.4);

        let bassEnergy = 0;
        let midEnergy = 0;
        let highEnergy = 0;

        for (let i = 0; i < bassRange; i++) {
          bassEnergy += frequencyData[i];
        }
        for (let i = bassRange; i < midRange; i++) {
          midEnergy += frequencyData[i];
        }
        for (let i = midRange; i < frequencyData.length; i++) {
          highEnergy += frequencyData[i];
        }

        bassEnergy /= bassRange * 255;
        midEnergy /= (midRange - bassRange) * 255;
        highEnergy /= (frequencyData.length - midRange) * 255;

        // Calculate overall amplitude (average of all frequencies)
        let overallAmplitude = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          overallAmplitude += frequencyData[i];
        }
        overallAmplitude /= frequencyData.length * 255;

        // Calculate spectral complexity (how many different frequencies are active)
        // More active frequencies = more complex/layered sound
        let activeFrequencies = 0;
        const threshold = 10; // Minimum amplitude to consider a frequency "active"
        for (let i = 0; i < frequencyData.length; i++) {
          if (frequencyData[i] > threshold) {
            activeFrequencies++;
          }
        }
        const spectralComplexity = activeFrequencies / frequencyData.length;
        
        // BEAT DETECTION: Detect rhythmic onsets by tracking energy spikes in bass/low-mid
        // Focus on frequencies 60-250 Hz (kick, snare, rhythmic elements)
        const beatRangeStart = Math.floor(frequencyData.length * 0.02); // ~60 Hz
        const beatRangeEnd = Math.floor(frequencyData.length * 0.15); // ~250 Hz
        
        let beatRangeEnergy = 0;
        for (let i = beatRangeStart; i < beatRangeEnd; i++) {
          beatRangeEnergy += frequencyData[i];
        }
        beatRangeEnergy /= (beatRangeEnd - beatRangeStart) * 255;
        
        // Track energy history for beat detection
        beatEnergyHistoryRef.current.push(beatRangeEnergy);
        beatEnergyHistoryRef.current.shift();
        
        // Calculate average energy over recent history
        const avgEnergy = beatEnergyHistoryRef.current.reduce((a, b) => a + b, 0) / beatEnergyHistoryRef.current.length;
        
        // Beat is detected when current energy significantly exceeds recent average
        // Using a threshold multiplier for sensitivity
        const beatThreshold = 1.3; // Current must be 30% higher than average
        const beatDetected = beatRangeEnergy > avgEnergy * beatThreshold;
        
        // Beat energy is normalized: 0 when no beat, up to 1.0 for strong beats
        // Use the ratio of current to average, clamped and scaled
        const beatEnergy = beatDetected 
          ? Math.min((beatRangeEnergy / (avgEnergy + 0.01) - 1.0) * 2.0, 1.0)
          : 0;
        
        // Get current playback time
        const currentTime = audioContextRef.current!.currentTime - startTimeRef.current;
        
        // Update current time callback
        if (onCurrentTime) {
          onCurrentTime(currentTime);
        }
        
        // Sample ramps at current time with smooth cubic interpolation
        let animationSpeedMultiplier = 1.0;
        let waveIntensityMultiplier = 2.5;
        
        if (speedRampRef.current && pitchRampRef.current && currentTime >= 0) {
          const samplesPerSecond = 2; // Match 2 samples per second rate
          const exactIndex = currentTime * samplesPerSecond;
          const index = Math.floor(exactIndex);
          const fraction = exactIndex - index;
          
          if (index >= 1 && index < speedRampRef.current.length - 2) {
            // Cubic interpolation for ultra-smooth transitions
            const t = fraction;
            const t2 = t * t;
            const t3 = t2 * t;
            
            // Speed ramp cubic interpolation
            const p0 = speedRampRef.current[index - 1];
            const p1 = speedRampRef.current[index];
            const p2 = speedRampRef.current[index + 1];
            const p3 = speedRampRef.current[index + 2];
            
            animationSpeedMultiplier = 
              0.5 * ((2 * p1) +
                     (-p0 + p2) * t +
                     (2*p0 - 5*p1 + 4*p2 - p3) * t2 +
                     (-p0 + 3*p1 - 3*p2 + p3) * t3);
            
            // Pitch ramp cubic interpolation
            const q0 = pitchRampRef.current[index - 1];
            const q1 = pitchRampRef.current[index];
            const q2 = pitchRampRef.current[index + 1];
            const q3 = pitchRampRef.current[index + 2];
            
            waveIntensityMultiplier = 
              0.5 * ((2 * q1) +
                     (-q0 + q2) * t +
                     (2*q0 - 5*q1 + 4*q2 - q3) * t2 +
                     (-q0 + 3*q1 - 3*q2 + q3) * t3);
          } else if (index < speedRampRef.current.length - 1) {
            // Linear interpolation for edge cases
            const speedCurrent = speedRampRef.current[index];
            const speedNext = speedRampRef.current[index + 1];
            animationSpeedMultiplier = speedCurrent + (speedNext - speedCurrent) * fraction;
            
            const pitchCurrent = pitchRampRef.current[index];
            const pitchNext = pitchRampRef.current[index + 1];
            waveIntensityMultiplier = pitchCurrent + (pitchNext - pitchCurrent) * fraction;
          } else if (index < speedRampRef.current.length) {
            animationSpeedMultiplier = speedRampRef.current[index];
            waveIntensityMultiplier = pitchRampRef.current[index];
          }
        }

        onAudioData({
          frequencyData,
          timeDomainData,
          bassEnergy,
          midEnergy,
          highEnergy,
          overallAmplitude,
          spectralComplexity,
          animationSpeedMultiplier,
          waveIntensityMultiplier,
          beatEnergy,
          isPlaying: true,
        });

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } else {
      // Pause
      if (sourceRef.current && audioContextRef.current && audioBufferRef.current) {
        const currentTime = audioContextRef.current.currentTime - startTimeRef.current;
        // Clamp pause time to valid range
        pauseTimeRef.current = Math.max(0, Math.min(currentTime, audioBufferRef.current.duration));
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, onAudioData, onPlayingChange]);

  return null;
}
