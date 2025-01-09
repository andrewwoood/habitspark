export const lightTheme = {
  background: '#FFF8E7',      // Light amber background
  surface: '#FFFFFF',         // White
  primary: '#8B4513',        // Dark amber
  secondary: '#D2691E',      // Medium amber
  accent: '#FFA500',         // Orange (for fire icon)
  text: {
    primary: '#8B4513',      // Dark amber
    secondary: '#D2691E',    // Medium amber
  },
  border: '#FFF8E7',
  shadow: {
    color: '#000000',
    opacity: 0.2,
  }
}

export const darkTheme = {
  background: '#1A1A1A',     // Dark background
  surface: '#2D2D2D',        // Slightly lighter dark
  primary: '#FFB74D',        // Light amber
  secondary: '#FFA726',      // Medium amber
  accent: '#FFD700',         // Gold (for fire icon)
  text: {
    primary: '#FFB74D',      // Light amber
    secondary: '#FFA726',    // Medium amber
  },
  border: '#2D2D2D',
  shadow: {
    color: '#000000',
    opacity: 0.4,
  }
}

export type Theme = typeof lightTheme 