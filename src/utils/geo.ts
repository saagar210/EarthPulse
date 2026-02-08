/**
 * Split a polyline at antimeridian crossings to avoid wraparound lines on the map.
 * Detects jumps > 180° in longitude between consecutive points and starts a new segment.
 */
export function splitAtAntimeridian(
  coords: [number, number][],
): [number, number][][] {
  const segments: [number, number][][] = [];
  let current: [number, number][] = [];

  for (let i = 0; i < coords.length; i++) {
    if (i > 0 && Math.abs(coords[i][1] - coords[i - 1][1]) > 180) {
      if (current.length > 0) segments.push(current);
      current = [];
    }
    current.push(coords[i]);
  }

  if (current.length > 0) segments.push(current);
  return segments;
}
