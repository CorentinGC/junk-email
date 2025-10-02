/**
 * Email storage service using Redis
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import redis from './redis';
import { saveAddress, incrementEmailCount, getEmailRetention } from './database';
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
 * Create temporary inbox address
 */
export async function createInboxAddress(address: string): Promise<InboxAddress> {
  const retention = getEmailRetention();
  const now = Date.now();
  const expiresAt = now + retention * 1000;
  
  const inbox: InboxAddress = {
    address,
    createdAt: now,
    expiresAt,
  };
  
  const key = `address:${address}`;
  await redis.setex(key, retention, JSON.stringify(inbox));
  
  // Save to persistent database
  saveAddress(address, now, expiresAt);
  
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
 * Delete email
 */
export async function deleteEmail(id: string): Promise<void> {
  const email = await getEmail(id);
  if (!email) return;
  
  await redis.del(`email:${id}`);
  
  for (const recipient of email.to) {
    const inboxKey = `inbox:${recipient.address}`;
    await redis.zrem(inboxKey, id);
  }
}


