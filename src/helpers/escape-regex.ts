import { REGEX_SPECIAL_CHARS } from '@/constants/patterns.constants';

export const escapeRegex = (value: string): string => {
  return value.replace(REGEX_SPECIAL_CHARS, '\\$&');
};
