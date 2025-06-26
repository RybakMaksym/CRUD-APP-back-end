import * as bcrypt from 'bcrypt';

export const comparePasswords = async (
  plain: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
