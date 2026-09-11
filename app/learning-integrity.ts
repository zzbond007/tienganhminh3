export function orderChoiceOptions(options: string[], answer: string, seed: number): string[] {
  const answerCount = options.filter((option) => option === answer).length;
  if (answerCount !== 1) throw new Error("A choice question must contain its answer exactly once.");
  const distractors = options.filter((option) => option !== answer);
  const answerIndex = ((seed % options.length) + options.length) % options.length;
  const ordered = [...distractors];
  ordered.splice(answerIndex, 0, answer);
  return ordered;
}

export function normalizeSpelling(value: string | string[]): string {
  const text = Array.isArray(value) ? value.join("") : value;
  return text.normalize("NFKC").toLocaleLowerCase("en").replace(/\s+/g, " ").trim();
}

export function spellingIsCorrect(target: string, arrangedLetters: string[]): boolean {
  return normalizeSpelling(target) === normalizeSpelling(arrangedLetters);
}

export function scoreWithSupport(hintLevel: number, failedAttempts: number): number {
  if (failedAttempts > 0) return Math.max(55, 65 - Math.max(0, hintLevel - 1) * 5);
  return [100, 85, 75, 65][Math.min(3, Math.max(0, hintLevel))];
}

export function averageSpeakingConfidence(
  records: Array<{ speakingConfidence?: number; speakingSamples?: number }>,
): number | undefined {
  const values = records
    .filter((record) => (record.speakingSamples ?? 0) > 0 && typeof record.speakingConfidence === "number")
    .map((record) => record.speakingConfidence as number);
  if (!values.length) return undefined;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

