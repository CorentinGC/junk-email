/**
 * SMTP Server for receiving emails
 * @author Eden Solutions <contact@eden-solutions.pro>
 */
import dotenv from 'dotenv';
import { SMTPServer } from 'smtp-server';
import { simpleParser, type AddressObject } from 'mailparser';
import { nanoid } from 'nanoid';
import { storeEmail } from '#lib/emailStorage';
import type { Email, EmailAddress } from '#types/email';

dotenv.config();

/**
 * Normalize address object to array
 * @param {AddressObject | AddressObject[] | undefined} addr - Address object or array
 * @returns {EmailAddress[]} Normalized array of addresses
 */
function normalizeAddresses(addr: AddressObject | AddressObject[] | undefined): EmailAddress[] {
  if (!addr) return [];
  const addresses = Array.isArray(addr) ? addr : [addr];
  return addresses.flatMap(a => 
    a.value.map(v => ({
      address: v.address || '',
      name: v.name,
    }))
  );
}

const SMTP_PORT = parseInt(process.env.SMTP_PORT || '25', 10);
const SMTP_HOST = process.env.SMTP_HOST || '0.0.0.0';
const SMTP_DOMAIN = process.env.SMTP_DOMAIN || 'localhost';

const server = new SMTPServer({
  secure: false,
  authOptional: true,
  disabledCommands: ['AUTH'],
  banner: `${SMTP_DOMAIN} ESMTP Junk-Mail`,
  
  onData(stream, session, callback) {
    let emailData = '';
    
    stream.on('data', (chunk) => {
      emailData += chunk.toString();
    });
    
    stream.on('end', async () => {
      try {
        const parsed = await simpleParser(emailData);
        
        const fromAddresses = normalizeAddresses(parsed.from);
        const toAddresses = normalizeAddresses(parsed.to);
        
        const email: Email = {
          id: nanoid(),
          from: fromAddresses[0] || {
            address: 'unknown@unknown',
            name: undefined,
          },
          to: toAddresses,
          subject: parsed.subject || '(No subject)',
          text: parsed.text || '',
          html: parsed.html || undefined,
          receivedAt: Date.now(),
          attachments: parsed.attachments?.map((att) => ({
            filename: att.filename || 'unnamed',
            contentType: att.contentType,
            size: att.size,
            content: att.content,
          })),
        };
        
        await storeEmail(email);
        
        console.log(`[SMTP] Email received: ${email.id} | From: ${email.from.address} | To: ${email.to.map(t => t.address).join(', ')}`);
        
        callback();
      } catch (err) {
        console.error('[SMTP] Error processing email:', err);
        callback(new Error('Failed to process email'));
      }
    });
  },
  
  onMailFrom(address, session, callback) {
    console.log(`[SMTP] MAIL FROM: ${address.address}`);
    callback();
  },
  
  onRcptTo(address, session, callback) {
    console.log(`[SMTP] RCPT TO: ${address.address}`);
    callback();
  },
});

server.on('error', (err) => {
  console.error('[SMTP] Server error:', err);
});

server.listen(SMTP_PORT, SMTP_HOST, () => {
  console.log(`[SMTP] Server listening on ${SMTP_HOST}:${SMTP_PORT}`);
  console.log(`[SMTP] Domain: ${SMTP_DOMAIN}`);
});

process.on('SIGTERM', () => {
  console.log('[SMTP] Shutting down gracefully...');
  server.close(() => {
    console.log('[SMTP] Server closed');
    process.exit(0);
  });
});


