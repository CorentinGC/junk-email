/**
 * Email storage service using Redis
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import redis from './redis';
import { saveAddress, incrementEmailCount, decrementEmailCount, resetEmailCount, getEmailRetention } from './database';
import type { Email, InboxAddress } from '#types/email';

/**
 * Serialize email for storage (convert Buffer to base64)
 * @param {Email} email - Email to serialize
 * @returns {string} Serialized email
 */
function serializeEmail(email: Email): string {
  const serializable = {
    ...email,
    attachments: email.attachments?.map(att => ({
      ...att,
      content: att.content ? att.content.toString('base64') : undefined,
    })),
  };
  return JSON.stringify(serializable);
}

/**
 * Deserialize email from storage (convert base64 to Buffer)
 * @param {string} data - Serialized email data
 * @returns {Email} Deserialized email
 */
function deserializeEmail(data: string): Email {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    attachments: parsed.attachments?.map((att: any) => ({
      ...att,
      content: att.content ? Buffer.from(att.content, 'base64') : undefined,
    })),
  };
}

/**
 * Store email in Redis with TTL
 */
export async function storeEmail(email: Email): Promise<void> {
  const retention = getEmailRetention();
  const key = `email:${email.id}`;
  await redis.setex(key, retention, serializeEmail(email));
  
  // Add to recipient inbox
  for (const recipient of email.to) {
    const inboxKey = `inbox:${recipient.address}`;
    await redis.zadd(inboxKey, email.receivedAt, email.id);
    await redis.expire(inboxKey, retention);
    
    // Increment email count in database
    incrementEmailCount(recipient.address);
  }
}

/**
 * Get email by ID
 */
export async function getEmail(id: string): Promise<Email | null> {
  const key = `email:${id}`;
  const data = await redis.get(key);
  return data ? deserializeEmail(data) : null;
}

/**
 * Get emails for an inbox address
 */
export async function getInboxEmails(address: string): Promise<Email[]> {
  const inboxKey = `inbox:${address}`;
  const emailIds = await redis.zrevrange(inboxKey, 0, -1);
  
  const emails = await Promise.all(
    emailIds.map(async (id) => {
      const email = await getEmail(id);
      return email;
    })
  );
  
  return emails.filter((e): e is Email => e !== null);
}

/**
 * Create permanent inbox address
 */
export async function createInboxAddress(address: string): Promise<InboxAddress> {
  const now = Date.now();
  
  const inbox: InboxAddress = {
    address,
    createdAt: now,
    expiresAt: 0, // 0 = permanent (no expiration)
  };
  
  const key = `address:${address}`;
  // Store permanently in Redis (no TTL)
  await redis.set(key, JSON.stringify(inbox));
  
  // Save to persistent database
  saveAddress(address, now);
  
  return inbox;
}

/**
 * Check if inbox address exists
 */
export async function getInboxAddress(address: string): Promise<InboxAddress | null> {
  const key = `address:${address}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Delete single email from Redis
 * @param {string} id - Email ID to delete
 */
export async function deleteEmail(id: string): Promise<void> {
  const email = await getEmail(id);
  if (!email) return;
  
  await redis.del(`email:${id}`);
  
  for (const recipient of email.to) {
    const inboxKey = `inbox:${recipient.address}`;
    await redis.zrem(inboxKey, id);
    
    // Decrement email count in database
    decrementEmailCount(recipient.address);
  }
  
  console.log(`[Delete] Removed email ${id}`);
}

/**
 * Delete all emails from an inbox (keeps address alive)
 * @param {string} address - Inbox address
 * @returns {Promise<number>} Number of emails deleted
 */
export async function deleteAllInboxEmails(address: string): Promise<number> {
  const inboxKey = `inbox:${address}`;
  
  // Get all email IDs for this inbox
  const emailIds = await redis.zrange(inboxKey, 0, -1);
  
  // Delete all emails
  for (const emailId of emailIds) {
    await redis.del(`email:${emailId}`);
  }
  
  // Clear inbox list
  await redis.del(inboxKey);
  
  // Reset email count in database
  resetEmailCount(address);
  
  console.log(`[Delete] Cleared ${emailIds.length} emails from inbox ${address}`);
  return emailIds.length;
}

/**
 * Delete inbox address and all its emails from Redis
 * @param {string} address - Email address to delete
 * @returns {Promise<number>} Number of emails deleted
 */
export async function deleteInboxAddress(address: string): Promise<number> {
  try {
    const key = `address:${address}`;
    const inboxKey = `inbox:${address}`;
    
    // Get all email IDs for this inbox
    const emailIds = await redis.zrange(inboxKey, 0, -1);
    
    // Delete all emails
    for (const emailId of emailIds) {
      await redis.del(`email:${emailId}`);
    }
    
    // Delete inbox key and address key
    await redis.del(inboxKey);
    await redis.del(key);
    
    console.log(`[Delete] Removed address ${address} with ${emailIds.length} emails`);
    return emailIds.length;
  } catch (error) {
    console.error('[Delete] Error deleting address:', error);
    throw error;
  }
}


