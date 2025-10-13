import seedrandom from 'seedrandom'

// Seeded random number generator for deterministic behavior
export const rng = seedrandom('1337')

// Utility functions for deterministic randomness
export const random = {
  // Generate deterministic random number between 0 and 1
  value: () => rng(),
  
  // Generate deterministic random integer between min and max (inclusive)
  int: (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min,
  
  // Generate deterministic random float between min and max
  float: (min: number, max: number) => rng() * (max - min) + min,
  
  // Pick random element from array deterministically
  choice: <T>(array: T[]): T => array[Math.floor(rng() * array.length)],
  
  // Shuffle array deterministically
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}
