const TOKEN_PATTERN = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*|[.,!?;:]/gu;

export function tokenizeSentence(sentence: string): string[] {
  return sentence.match(TOKEN_PATTERN) ?? sentence.trim().split(/\s+/).filter(Boolean);
}

export function normalizeSentence(value: string | string[]): string {
  const tokens = Array.isArray(value) ? value : tokenizeSentence(value);
  return tokens
    .map((token) => token.normalize("NFKC").replaceAll("’", "'").toLocaleLowerCase("en"))
    .join(" ");
}

export function sentenceIsCorrect(target: string, orderedTokens: string[]): boolean {
  return normalizeSentence(target) === normalizeSentence(orderedTokens);
}

export function correctPrefixLength(targetTokens: string[], orderedTokens: string[]): number {
  let length = 0;
  while (
    length < targetTokens.length &&
    length < orderedTokens.length &&
    normalizeSentence([targetTokens[length]]) === normalizeSentence([orderedTokens[length]])
  ) {
    length += 1;
  }
  return length;
}

export function isPunctuation(token: string): boolean {
  return /^[.,!?;:]$/.test(token);
}
