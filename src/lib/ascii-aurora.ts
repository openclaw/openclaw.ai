export const ASCII_AURORA_FRAME_INTERVAL = 100;

const CHARACTERS = ' .:-=+xX#8@';
const COLUMN_COUNT = 220;
const ROW_COUNT = 26;
const BAYER_MATRIX = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

type AuroraCell = {
  distance: number;
  envelope: number;
  threshold: number;
};

const cells: AuroraCell[][] = Array.from({ length: ROW_COUNT }, (_, row) =>
  Array.from({ length: COLUMN_COUNT }, (_, column) => {
    const horizontalDistance = column - COLUMN_COUNT / 2;
    const verticalDistance = (ROW_COUNT + 5 - row) * 1.9;
    const distance = Math.sqrt(
      horizontalDistance * horizontalDistance + verticalDistance * verticalDistance,
    );
    const angle = Math.atan2(verticalDistance, horizontalDistance);
    const fan = Math.pow(Math.sin(angle), 2);
    const decay = Math.min(Math.max(1.15 - distance / 110, 0), 1);
    const quietCenter = Math.min(Math.max((distance - 24) / 18, 0), 1);

    return {
      distance,
      envelope: fan * decay * quietCenter * 1.4,
      threshold: (BAYER_MATRIX[row % 4][column % 4] + 0.5) / 16,
    };
  }),
);

export function renderAsciiAurora(elapsedSeconds = 0): string {
  let output = '';

  cells.forEach((row) => {
    row.forEach(({ distance, envelope, threshold }) => {
      const ring = 0.5 + 0.5 * Math.sin(distance * 0.3 - elapsedSeconds * 0.35);
      let intensity = Math.pow(ring, 3.5) * envelope;
      if (intensity < 0.05) intensity = 0;
      intensity = Math.min(Math.max(intensity, 0), 1);

      const level = intensity * (CHARACTERS.length - 1);
      const characterIndex = Math.min(
        CHARACTERS.length - 1,
        Math.floor(level) + (level % 1 > threshold ? 1 : 0),
      );
      output += CHARACTERS[characterIndex];
    });
    output += '\n';
  });

  return output;
}
