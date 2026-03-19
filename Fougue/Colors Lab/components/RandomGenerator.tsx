// Predefined color palettes from the app
const PALETTE_COLORS = [
  // Palette 1: Test 1
  "#ED72C9", "#FF7A40", "#6889F9", "#4767D6",
  // Palette 2: AM : Jardin
  "#58AB60", "#B8BE5D", "#FAF7D6", "#F5C5C0", "#F698D0",
  // Palette 3: AM : Aube
  "#FF5733", "#F5C5C0", "#FABC90", "#BDD7F2",
  // Palette 4: Test 2
  "#6889F9", "#FAF7D6", "#DD9BB3", "#A09CF2",
  // Palette 7: PM : Sunset
  "#C5BFDE", "#F5C5C0", "#FABC90", "#FF7A40", "#CF342B",
]

export interface RandomSettings {
  colors: string[]
  animationSpeed: number
  noiseIntensity: number
  zoom: number
}

export function generateRandomSettings(): RandomSettings {
  // Randomize the number of colors (2-4 colors)
  const numColors = Math.floor(Math.random() * 3) + 2 // 2-4 colors
  
  // Shuffle the palette colors and pick random ones
  const shuffled = [...PALETTE_COLORS].sort(() => Math.random() - 0.5)
  const colors = shuffled.slice(0, numColors)
  
  // Random animation speed (0.3x to 2.5x)
  const animationSpeed = Math.round((Math.random() * 2.2 + 0.3) * 10) / 10
  
  // Random noise intensity (0.5 to 2.5)
  const noiseIntensity = Math.round((Math.random() * 2.0 + 0.5) * 10) / 10
  
  // Random zoom (0.6x to 1.8x)
  const zoom = Math.round((Math.random() * 1.2 + 0.6) * 10) / 10
  
  return {
    colors,
    animationSpeed,
    noiseIntensity,
    zoom
  }
}