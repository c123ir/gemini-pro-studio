console.log('Test script started');

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

try {
  console.log('Configuring dotenv...');
  dotenv.config();
  console.log('dotenv configured');
  
  console.log('Creating PrismaClient...');
  const prisma = new PrismaClient();
  console.log('Prisma instance created');
  
  // برای جلوگیری از خروج سریع
  setTimeout(() => {
    console.log('Test script is still running');
  }, 5000);
  
} catch (error) {
  console.error('Error in test script:', error);
}

console.log('Test script reached end'); 