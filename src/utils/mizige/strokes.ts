export interface CharacterStrokeData {
  strokes: string[];
  medians: number[][][];
}

const cache = new Map<string, CharacterStrokeData | null>();

export async function loadStrokeData(char: string): Promise<CharacterStrokeData | null> {
  if (cache.has(char)) return cache.get(char)!;

  try {
    const response = await fetch(`/hanzi-writer-data/${char}.json`);
    if (!response.ok) {
      cache.set(char, null);
      return null;
    }
    const data = await response.json();
    const result: CharacterStrokeData = {
      strokes: data.strokes,
      medians: data.medians,
    };
    cache.set(char, result);
    return result;
  } catch {
    cache.set(char, null);
    return null;
  }
}

export interface StrokeFrame {
  completedStrokes: string[];
  currentStroke: string;
  frameNumber: number;
  totalStrokes: number;
}

export function generateStrokeFrames(
  strokeData: CharacterStrokeData,
  maxFrames: number,
): StrokeFrame[] {
  const { strokes } = strokeData;
  const total = strokes.length;

  if (total <= maxFrames) {
    return strokes.map((stroke, i) => ({
      completedStrokes: strokes.slice(0, i),
      currentStroke: stroke,
      frameNumber: i + 1,
      totalStrokes: total,
    }));
  }

  const frames: StrokeFrame[] = [];
  for (let i = 0; i < maxFrames - 1; i++) {
    frames.push({
      completedStrokes: strokes.slice(0, i),
      currentStroke: strokes[i],
      frameNumber: i + 1,
      totalStrokes: total,
    });
  }

  frames.push({
    completedStrokes: strokes.slice(0, total - 1),
    currentStroke: strokes[total - 1],
    frameNumber: total,
    totalStrokes: total,
  });

  return frames;
}

export async function filterAvailableChars(chars: string[]): Promise<string[]> {
  const results = await Promise.all(
    chars.map(async (char) => {
      const data = await loadStrokeData(char);
      return data ? char : null;
    })
  );
  return results.filter((c): c is string => c !== null);
}
