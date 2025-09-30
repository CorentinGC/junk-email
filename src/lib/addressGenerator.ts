/**
 * Generate random email addresses
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { nanoid } from 'nanoid';

/**
 * Generate random disposable email address
 */
export function generateEmailAddress(domain: string): string {
  const localPart = nanoid(10).toLowerCase();
  return `${localPart}@${domain}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
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


