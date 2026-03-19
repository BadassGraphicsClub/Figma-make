"use client"
import { useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from "react"
import * as THREE from "three"

interface RadialGradientProps {
  colors: string[]
  paletteId?: number
  audioData?: {
    bassEnergy: number
    midEnergy: number
    highEnergy: number
    overallAmplitude: number
    spectralComplexity: number
    animationSpeedMultiplier: number
    waveIntensityMultiplier: number
  }
  animationSpeed?: number
  noiseIntensityMultiplier?: number
  flowScale?: number
  waveIntensity?: number
  stripEffect?: boolean
}

export interface RadialGradientRef {
  getCanvas: () => HTMLCanvasElement | null
}

const RadialGradient = forwardRef<RadialGradientRef, RadialGradientProps>(
  ({ 
    colors,
    paletteId = 1,
    audioData,
    animationSpeed: baseAnimationSpeed = 0.6,
    noiseIntensityMultiplier = 1.1,
    flowScale = 1.8,
    waveIntensity: baseWaveIntensity = 2.5,
    stripEffect = false
  }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const clockRef = useRef(new THREE.Clock())
  const animationFrameRef = useRef<number>()
  
  // Smoothed audio values with refs for easing
  const smoothedBass = useRef(0)
  const smoothedMid = useRef(0)
  const smoothedHigh = useRef(0)
  const smoothedAmplitude = useRef(0)
  const smoothedComplexity = useRef(0)
  const smoothedSpeedMultiplier = useRef(1.0)
  const smoothedWaveMultiplier = useRef(2.5)
  
  // Additional temporal smoothing buffers
  const speedHistory = useRef<number[]>(Array(20).fill(1.0))
  const waveHistory = useRef<number[]>(Array(20).fill(2.5))
  const amplitudeHistory = useRef<number[]>(Array(60).fill(0))
  
  // Noise intensity update throttle
  const lastNoiseUpdateTime = useRef(0)
  const currentNoiseIntensity = useRef(noiseIntensityMultiplier)

  useImperativeHandle(ref, () => ({
    getCanvas: () => rendererRef.current?.domElement || null
  }))

  // Convert hex colors to RGB values for shader
  const colorValues = useMemo(() => {
    return colors.map(color => {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      return [r, g, b]
    })
  }, [colors])

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector3() },
      colorCount: { value: colors.length },
      paletteId: { value: paletteId },
      colors: { 
        value: colorValues.flat().concat(Array(24 - colorValues.flat().length).fill(0))
      },
      speedMultiplier: { value: baseAnimationSpeed },
      noiseIntensity: { value: noiseIntensityMultiplier },
      flowScaleMultiplier: { value: flowScale },
      waveIntensityMultiplier: { value: baseWaveIntensity },
      bassEnergy: { value: 0.0 },
      midEnergy: { value: 0.0 },
      highEnergy: { value: 0.0 },
      overallAmplitude: { value: 0.0 },
      spectralComplexity: { value: 0.0 },
      stripEffect: { value: stripEffect ? 1.0 : 0.0 },
      stripOffset: { value: 0.0 },
    }),
    [colors.length, paletteId, colorValues, baseAnimationSpeed, noiseIntensityMultiplier, flowScale, baseWaveIntensity, stripEffect],
  )

  useEffect(() => {
    if (!containerRef.current) return

    // Setup scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Setup camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    cameraRef.current = camera

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 1)
    rendererRef.current = renderer

    // Setup geometry and material
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms,
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    meshRef.current = mesh
    scene.add(mesh)

    containerRef.current.appendChild(renderer.domElement)

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      rendererRef.current.setSize(width, height)
      uniforms.iResolution.value.set(width, height, 1)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Animation loop
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return

      const elapsedTime = clockRef.current.getElapsedTime()
      
      uniforms.iTime.value = elapsedTime
      uniforms.colorCount.value = colors.length
      uniforms.paletteId.value = paletteId
      uniforms.colors.value = colorValues.flat().concat(Array(24 - colorValues.flat().length).fill(0))
      
      const frequencyLerpFactor = 0.03
      const amplitudeLerpFactor = 0.008
      const complexityLerpFactor = 0.03
      const rampLerpFactor = 0.005
      
      if (audioData) {
        const targetBass = audioData.bassEnergy
        const targetMid = audioData.midEnergy
        const targetHigh = audioData.highEnergy
        const targetAmplitude = audioData.overallAmplitude
        const targetComplexity = audioData.spectralComplexity
        const targetSpeedMultiplier = audioData.animationSpeedMultiplier
        const targetWaveMultiplier = audioData.waveIntensityMultiplier
        
        smoothedBass.current += (targetBass - smoothedBass.current) * frequencyLerpFactor
        smoothedMid.current += (targetMid - smoothedMid.current) * frequencyLerpFactor
        smoothedHigh.current += (targetHigh - smoothedHigh.current) * frequencyLerpFactor
        smoothedAmplitude.current += (targetAmplitude - smoothedAmplitude.current) * amplitudeLerpFactor
        smoothedComplexity.current += (targetComplexity - smoothedComplexity.current) * complexityLerpFactor
        
        smoothedSpeedMultiplier.current += (targetSpeedMultiplier - smoothedSpeedMultiplier.current) * rampLerpFactor
        smoothedWaveMultiplier.current += (targetWaveMultiplier - smoothedWaveMultiplier.current) * rampLerpFactor
      } else {
        smoothedBass.current += (0 - smoothedBass.current) * frequencyLerpFactor
        smoothedMid.current += (0 - smoothedMid.current) * frequencyLerpFactor
        smoothedHigh.current += (0 - smoothedHigh.current) * frequencyLerpFactor
        smoothedAmplitude.current += (0 - smoothedAmplitude.current) * amplitudeLerpFactor
        smoothedComplexity.current += (0 - smoothedComplexity.current) * complexityLerpFactor
        smoothedSpeedMultiplier.current += (1.0 - smoothedSpeedMultiplier.current) * rampLerpFactor
        smoothedWaveMultiplier.current += (2.5 - smoothedWaveMultiplier.current) * rampLerpFactor
      }
      
      amplitudeHistory.current.push(smoothedAmplitude.current)
      amplitudeHistory.current.shift()
      const ultraSmoothAmplitude = amplitudeHistory.current.reduce((a, b) => a + b, 0) / amplitudeHistory.current.length
      
      speedHistory.current.push(smoothedSpeedMultiplier.current)
      speedHistory.current.shift()
      const avgSpeed = speedHistory.current.reduce((a, b) => a + b, 0) / speedHistory.current.length
      
      waveHistory.current.push(smoothedWaveMultiplier.current)
      waveHistory.current.shift()
      const avgWave = waveHistory.current.reduce((a, b) => a + b, 0) / waveHistory.current.length
      
      uniforms.bassEnergy.value = smoothedBass.current
      uniforms.midEnergy.value = smoothedMid.current
      uniforms.highEnergy.value = smoothedHigh.current
      uniforms.overallAmplitude.value = ultraSmoothAmplitude
      uniforms.spectralComplexity.value = smoothedComplexity.current
      
      const finalAnimationSpeed = audioData 
        ? Math.max(0.6, baseAnimationSpeed * avgSpeed)
        : baseAnimationSpeed
      uniforms.speedMultiplier.value = finalAnimationSpeed
      
      const finalWaveIntensity = baseWaveIntensity * (1.0 + (avgWave / 2.5 - 1.0) * 0.3)
      uniforms.waveIntensityMultiplier.value = finalWaveIntensity
      
      if (elapsedTime - lastNoiseUpdateTime.current >= 0.5) {
        const noiseIntensity = noiseIntensityMultiplier + (smoothedComplexity.current * 0.3)
        currentNoiseIntensity.current = noiseIntensity
        lastNoiseUpdateTime.current = elapsedTime
      }
      uniforms.noiseIntensity.value = currentNoiseIntensity.current
      
      uniforms.flowScaleMultiplier.value = flowScale
      
      uniforms.stripEffect.value = stripEffect ? 1.0 : 0.0
      if (stripEffect && audioData) {
        uniforms.stripOffset.value += 0.001
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      geometry.dispose()
      material.dispose()
      rendererRef.current?.dispose()
    }
  }, [colors, paletteId, audioData, baseAnimationSpeed, noiseIntensityMultiplier, flowScale, baseWaveIntensity, stripEffect, uniforms, colorValues])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
  )
})

export default RadialGradient

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform vec3 iResolution;
  uniform float iTime;
  uniform int colorCount;
  uniform int paletteId;
  uniform float colors[24];
  uniform float speedMultiplier;
  uniform float noiseIntensity;
  uniform float flowScaleMultiplier;
  uniform float waveIntensityMultiplier;
  uniform float bassEnergy;
  uniform float midEnergy;
  uniform float highEnergy;
  uniform float overallAmplitude;
  uniform float spectralComplexity;
  uniform float stripEffect;
  uniform float stripOffset;
  varying vec2 vUv;

  #define BLEND_MODE 5
  #define SPEED 1.0
  #define INTENSITY 0.075
  #define MEAN 0.0
  #define VARIANCE 0.5

  vec4 permute(vec4 x) {
    return mod(((x*34.0)+1.0)*x, 289.0);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 =   v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0); 
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  vec3 channel_mix(vec3 a, vec3 b, vec3 w) {
    return vec3(mix(a.r, b.r, w.r), mix(a.g, b.g, w.g), mix(a.b, b.b, w.b));
  }

  float gaussian(float z, float u, float o) {
    return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
  }

  vec3 screen(vec3 a, vec3 b, float w) {
    return mix(a, vec3(1.0) - (vec3(1.0) - a) * (vec3(1.0) - b), w);
  }

  vec3 overlay(vec3 a, vec3 b, float w) {
    return mix(a, channel_mix(2.0 * a * b, vec3(1.0) - 2.0 * (vec3(1.0) - a) * (vec3(1.0) - b), step(vec3(0.5), a)), w);
  }

  vec3 soft_light(vec3 a, vec3 b, float w) {
    return mix(a, pow(a, pow(vec3(2.0), 2.0 * (vec3(0.5) - b))), w);
  }

  vec3 rgb2hsl(vec3 color) {
    float maxColor = max(max(color.r, color.g), color.b);
    float minColor = min(min(color.r, color.g), color.b);
    float delta = maxColor - minColor;
    float h = 0.0;
    float s = 0.0;
    float l = (maxColor + minColor) / 2.0;
    if (delta > 0.0) {
      s = l < 0.5 ? delta / (maxColor + minColor) : delta / (2.0 - maxColor - minColor);
      if (color.r >= maxColor) {
        h = (color.g - color.b) / delta + (color.g < color.b ? 6.0 : 0.0);
      } else if (color.g >= maxColor) {
        h = (color.b - color.r) / delta + 2.0;
      } else {
        h = (color.r - color.g) / delta + 4.0;
      }
      h /= 6.0;
    }
    return vec3(h, s, l);
  }

  float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
  }

  vec3 hsl2rgb(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;
    if (s == 0.0) {
      return vec3(l);
    }
    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;
    return vec3(hue2rgb(p, q, h + 1.0/3.0), hue2rgb(p, q, h), hue2rgb(p, q, h - 1.0/3.0));
  }

  vec3 luminosity(vec3 base, vec3 blend, float w) {
    vec3 baseHSL = rgb2hsl(base);
    vec3 blendHSL = rgb2hsl(blend);
    vec3 result = hsl2rgb(vec3(baseHSL.x, baseHSL.y, blendHSL.z));
    return mix(base, result, w);
  }

  vec3 multiColorGradient(float t) {
    t = clamp(t, 0.0, 1.0);
    if (colorCount <= 1) {
      return vec3(colors[0] / 255.0, colors[1] / 255.0, colors[2] / 255.0);
    }
    if (paletteId == 2 && colorCount == 5) {
      if (t < 0.7) {
        t = (t / 0.7) * 2.0;
        float scaledT = t;
        int index = int(floor(scaledT));
        float localT = fract(scaledT);
        if (index >= 2) {
          index = 1;
          localT = 1.0;
        }
        int currentIndex = index * 3;
        int nextIndex = (index + 1) * 3;
        vec3 currentColor = vec3(colors[currentIndex] / 255.0, colors[currentIndex + 1] / 255.0, colors[currentIndex + 2] / 255.0);
        vec3 nextColor = vec3(colors[nextIndex] / 255.0, colors[nextIndex + 1] / 255.0, colors[nextIndex + 2] / 255.0);
        float smoothT = smoothstep(0.0, 1.0, localT);
        return mix(currentColor, nextColor, smoothT);
      } else {
        t = ((t - 0.7) / 0.3) * 2.0;
        float scaledT = t;
        int index = int(floor(scaledT)) + 2;
        float localT = fract(scaledT);
        if (index >= colorCount - 1) {
          index = colorCount - 2;
          localT = 1.0;
        }
        int currentIndex = index * 3;
        int nextIndex = (index + 1) * 3;
        vec3 currentColor = vec3(colors[currentIndex] / 255.0, colors[currentIndex + 1] / 255.0, colors[currentIndex + 2] / 255.0);
        vec3 nextColor = vec3(colors[nextIndex] / 255.0, colors[nextIndex + 1] / 255.0, colors[nextIndex + 2] / 255.0);
        float smoothT = smoothstep(0.0, 1.0, localT);
        return mix(currentColor, nextColor, smoothT);
      }
    }
    float scaledT = t * float(colorCount - 1);
    int index = int(floor(scaledT));
    float localT = fract(scaledT);
    if (index >= colorCount - 1) {
      int lastIndex = (colorCount - 1) * 3;
      return vec3(colors[lastIndex] / 255.0, colors[lastIndex + 1] / 255.0, colors[lastIndex + 2] / 255.0);
    }
    int currentIndex = index * 3;
    int nextIndex = (index + 1) * 3;
    vec3 currentColor = vec3(colors[currentIndex] / 255.0, colors[currentIndex + 1] / 255.0, colors[currentIndex + 2] / 255.0);
    vec3 nextColor = vec3(colors[nextIndex] / 255.0, colors[nextIndex + 1] / 255.0, colors[nextIndex + 2] / 255.0);
    float smoothT = smoothstep(0.0, 1.0, localT);
    return mix(currentColor, nextColor, smoothT);
  }

  vec3 applyGrain(vec3 color, vec2 uv) {
    float t = iTime * SPEED;
    float seed = dot(uv, vec2(12.9898, 78.233));
    float grainNoise = fract(sin(seed) * 43758.5453 + t);
    grainNoise = gaussian(grainNoise, MEAN, VARIANCE * VARIANCE);
    vec3 grain = vec3(grainNoise) * (1.0 - color);
    float w = INTENSITY;
    #if BLEND_MODE == 5
    color = luminosity(color, grain, w);
    #endif
    return color;
  }

  vec2 getStripOffsetAndMask(vec2 uv) {
    if (stripEffect < 0.5) return vec2(0.0, 1.0);
    float stripCount = 50.0;
    float angle = atan(uv.y, uv.x);
    float normalizedAngle = (angle + 3.14159265) / (2.0 * 3.14159265);
    float x = (normalizedAngle + stripOffset) * stripCount;
    float stripIndex = floor(x);
    float stripPos = fract(x);
    float stripNoise = fract(sin(stripIndex * 43758.5453) * 12.9898);
    float offset = (stripNoise - 0.5) * 0.25;
    float edgeFade = 0.15;
    float mask = smoothstep(0.0, edgeFade, stripPos) * smoothstep(1.0, 1.0 - edgeFade, stripPos);
    mask = pow(mask, 0.6);
    return vec2(offset, mask);
  }

  void mainImage(out vec4 O, in vec2 I) {
    vec2 uv = (I - 0.5 * iResolution.xy) / iResolution.y;
    float time = iTime * speedMultiplier;
    vec2 polar = vec2(length(uv), atan(uv.y, uv.x));
    float breathing = sin(time * 0.15) * 0.5 + 0.5;
    float breathingScale = 0.85 + breathing * 0.15;
    polar.x *= breathingScale;
    float radialNoise1 = snoise(vec3(uv * 0.4 + vec2(cos(time * 0.08), sin(time * 0.08)) * 0.5, time * 0.02));
    float radialNoise2 = snoise(vec3(uv * 0.6 - vec2(sin(time * 0.06), cos(time * 0.06)) * 0.3, time * 0.03));
    float radialFlow = radialNoise1 * 0.6 + radialNoise2 * 0.4;
    float angle = polar.y + radialFlow * 0.5;
    float radius = polar.x + radialFlow * 0.3;
    float spiralNoise = snoise(vec3(cos(angle * 2.0 + time * 0.1) * radius * 0.8, sin(angle * 2.0 + time * 0.1) * radius * 0.8, time * 0.04));
    radius += spiralNoise * 0.2 * noiseIntensity;
    float layeredFlow1 = snoise(vec3(uv * (0.6 / flowScaleMultiplier) + vec2(time * 0.03, 0.0), time * 0.03));
    float layeredFlow2 = snoise(vec3(uv * (0.9 / flowScaleMultiplier) - vec2(0.0, time * 0.04), time * 0.04));
    float combinedFlow = layeredFlow1 * 0.6 + layeredFlow2 * 0.4;
    float gradientPos = radius * 0.7 + combinedFlow * 0.3;
    gradientPos = gradientPos * 0.5 + 0.5;
    float pulsation = (1.0 - overallAmplitude * 0.3) * waveIntensityMultiplier;
    float wave = sin(angle * 3.0 + time * 0.2) * cos(radius * 2.0 - time * 0.15) * (0.08 * pulsation);
    gradientPos += wave;
    float frequencyBalance = (highEnergy - bassEnergy) * 0.3;
    gradientPos = gradientPos + frequencyBalance;
    float midVariation = midEnergy * 0.12 * sin(time * 0.18);
    gradientPos += midVariation;
    vec2 stripData = getStripOffsetAndMask(uv);
    float stripOffsetValue = stripData.x;
    float edgeMask = stripData.y;
    float baseGradientPos = smoothstep(0.05, 0.95, clamp(gradientPos, 0.0, 1.0));
    vec3 baseColor = multiColorGradient(baseGradientPos);
    float offsetGradientPos = smoothstep(0.05, 0.95, clamp(gradientPos + stripOffsetValue, 0.0, 1.0));
    vec3 offsetColor = multiColorGradient(offsetGradientPos);
    vec3 color = mix(baseColor, offsetColor, edgeMask * (stripEffect > 0.5 ? 1.0 : 0.0) + (stripEffect > 0.5 ? 0.0 : 1.0));
    vec3 colorHSL = rgb2hsl(color);
    colorHSL.y = clamp(colorHSL.y * (1.0 + midEnergy * 0.2), 0.0, 1.0);
    color = hsl2rgb(colorHSL);
    vec3 finalColor = applyGrain(color, vUv);
    O = vec4(finalColor, 1.0);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    mainImage(gl_FragColor, fragCoord);
  }
`
