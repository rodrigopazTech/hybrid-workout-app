export function parseWorkoutDescription(description: string) {
  if (!description) return [];

  // Regex para buscar líneas con ejercicios (ej: "1. Press de banca | 4 x 5-6 reps - 80 kg")
  const lines = description.split('\n');
  const exercises: any[] = [];

  lines.forEach((line) => {
    const match = line.match(/^(\d+)\.\s+(.+)\s*\|\s*(\d+)\s*x\s*(.+)\s*-\s*(.+)/);
    if (match) {
      exercises.push({
        id: Math.random().toString(36).substr(2, 9),
        order: parseInt(match[1]),
        name: match[2].trim(),
        sets: parseInt(match[3]),
        reps: match[4].trim(),
        initialWeight: match[5].trim(),
        completedSets: []
      });
    }
  });

  return exercises;
}
