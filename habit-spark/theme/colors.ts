export const lightTheme = {
  background: '#fff7ed',      // from-amber-50 gradient
  surface: '#ffffff',         // bg-white
  primary: '#d97706',        // text-amber-600
  secondary: '#92400e',      // text-amber-800
  accent: '#f59e0b',         // amber-500
  text: {
    primary: '#92400e',      // text-amber-800
    secondary: '#d97706',    // text-amber-600
    header: '#92400e',       // text-amber-800 used in headers
    card: '#92400e',         // text-amber-800 used in cards
    streak: '#d97706',       // text-amber-600 used for interactive elements
    disabled: '#d1d5db',     // gray-300 for disabled/muted text
  },
  border: '#fde68a',         // border-amber-200
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
    disabled: '#6b7280',     // gray-500 for disabled/muted text in dark mode
  },
  border: '#2D2D2D',
  shadow: {
    color: '#000000',
    opacity: 0.4,
  }
}

export type Theme = typeof lightTheme 