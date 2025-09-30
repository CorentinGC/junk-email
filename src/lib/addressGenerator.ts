/**
 * Generate random email addresses
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

/**
 * Generate random disposable email address
 * Uses only safe alphanumeric characters (a-z, 0-9)
 */
export function generateEmailAddress(domain: string): string {
  const localPart = nanoid();
  return `${localPart}@${domain}`;
}

/**
 * Validate email format
 * Accepts localhost and domains without TLD for development
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate email local part (before @)
 * Only allows: a-z, 0-9, dot, hyphen, underscore
 * @param {string} localPart - Local part of email (before @)
 * @returns {boolean} True if valid
 */
export function isValidLocalPart(localPart: string): boolean {
  // Must not be empty
  if (!localPart || localPart.length === 0) {
    return false;
  }
  
  // Must not start or end with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }
  
  // Only alphanumeric, dot, hyphen, underscore allowed
  const regex = /^[a-z0-9._-]+$/i;
  return regex.test(localPart);
}

/**
 * Extract local part from email
 */
export function getLocalPart(email: string): string {
  return email.split('@')[0] || '';
}

/**
 * Extract domain from email
 */
export function getDomain(email: string): string {
  return email.split('@')[1] || '';
}


