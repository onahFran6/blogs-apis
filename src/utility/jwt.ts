import jwt from 'jsonwebtoken';
import dotenv from '../config/dotenv';

const secretKey = dotenv.jwtSecret;

// Function to generate JWT token
export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, secretKey, {
    expiresIn: '24h',
  });
};

// Function to verify JWT token
export const verifyToken = (token: string) => {
  return jwt.verify(token, secretKey);
};
