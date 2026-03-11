import { pinyin } from 'pinyin-pro';

export function getPinyin(char: string): string {
  return pinyin(char, { toneType: 'symbol', type: 'array' })[0] || '';
}

export function isChinese(char: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(char);
}

export function extractChineseChars(text: string): string[] {
  return [...text].filter(isChinese);
}
