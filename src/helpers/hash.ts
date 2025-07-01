import { compareSync, hashSync } from 'bcrypt';

export const hash = (password: string): string => {
  return hashSync(password, +process.env.SALT_ROUNDS);
};

export const compareHash = (plain: string, hash: string): boolean => {
  return compareSync(plain, hash);
};
