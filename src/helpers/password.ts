import { compareSync, hashSync } from 'bcrypt';

export const hashPassword = (password: string): string => {
  return hashSync(password, +process.env.SALT_ROUNDS);
};

export const comparePasswords = (plain: string, hash: string): boolean => {
  return compareSync(plain, hash);
};
