export const PUNCTUATION_REGEX = /[(){}[\]<>.,;:'"!?+\-=*/\\|&%^$#@~`]/;
export const isWhitespaceChar = (char: string): boolean => /\s/.test(char);
export const wordSegmenter = new Intl.Segmenter(undefined, { granularity: "word" });
