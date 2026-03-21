import type { Coords } from '../types/coords.type.js'

export function parsePosition(posStr: string) {
  const coords: Coords = { x: 0, y: 0, z: 0 }

  posStr.split(/\s+/).forEach(part => {
    const [key, value] = part.split(':')
    if (key && value) {
      const lowerKey = key.toLowerCase() as keyof Coords
      coords[lowerKey] = parseFloat(value)
    }
  })

  return coords
}
