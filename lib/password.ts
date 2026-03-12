import argon2 from "argon2";

// Argon2 configuration for secure password hashing
const ARGON2_OPTIONS = {
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 3, // number of iterations
  parallelism: 1, // number of threads
  type: argon2.argon2id, // Argon2id is recommended for passwords
};

/**
 * Hash a password using Argon2id
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, ARGON2_OPTIONS);
  } catch (error) {
    throw new Error(`Failed to hash password: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Verify a password against its hash using Argon2id
 * @param password - Plain text password to verify
 * @param hash - Hashed password to verify against
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    throw new Error(`Failed to verify password: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if a hash needs to be rehashed (useful for algorithm updates)
 * @param hash - Hashed password to check
 * @returns Promise<boolean> - True if hash needs rehashing
 */
export async function needsRehash(hash: string): Promise<boolean> {
  try {
    return await argon2.needsRehash(hash, ARGON2_OPTIONS);
  } catch (error) {
    throw new Error(`Failed to check rehash requirement: ${error instanceof Error ? error.message : String(error)}`);
  }
}
