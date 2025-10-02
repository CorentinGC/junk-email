/**
 * Email types
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

export interface EmailAddress {
  address: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content?: Buffer;
}

export interface Email {
  id: string;
  from: EmailAddress;
  to: EmailAddress[];
  subject: string;
  text: string;
  html?: string;
  receivedAt: number;
  attachments?: EmailAttachment[];
}

export interface InboxAddress {
  address: string;
  createdAt: number;
  expiresAt: number; // 0 = permanent (addresses no longer expire)
}


