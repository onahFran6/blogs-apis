import bcrypt from 'bcrypt';

/**
 * Hash a password before saving it to the database.
 * @param password The plain text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10; // You can adjust the number of salt rounds if needed
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password.
 * @param password The plain text password.
 * @param hash The hashed password to compare against.
 * @returns A promise that resolves to true if the password matches the hash, false otherwise.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
