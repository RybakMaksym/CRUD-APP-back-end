import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, +process.env.SALT_ROUNDS);
};
