const MAX_INPUT_LENGTH = 10000;

/**
 * 入力文字列のサニタイズ
 * 極端に長い入力をトリムする
 */
export function sanitizeInput(input: string): string {
  if (input.length > MAX_INPUT_LENGTH) {
    return input.slice(0, MAX_INPUT_LENGTH);
  }
  return input;
}
