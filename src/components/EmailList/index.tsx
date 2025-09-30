/**
 * Email list component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { MdEmail, MdAttachFile } from 'react-icons/md';
import type { Email } from '#types/email';
import styles from './EmailList.module.scss';

interface Props {
  emails: Email[];
  loading: boolean;
  onSelect: (email: Email) => void;
}

/**
 * Format timestamp to relative time
 */
function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function EmailList({ emails, loading, onSelect }: Props) {
  if (loading && emails.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Loading emails...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className={styles.emptyState}>
        <MdEmail className={styles.emptyIcon} />
        <p>No emails yet</p>
        <small>Emails will appear here when received</small>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {emails.map((email) => (
        <div
          key={email.id}
          className={styles.item}
          onClick={() => onSelect(email)}
        >
          <div className={styles.header}>
            <span className={styles.from}>{email.from.name || email.from.address}</span>
            <span className={styles.time}>{formatTime(email.receivedAt)}</span>
          </div>
          <div className={styles.subject}>
            {email.subject}
            {email.attachments && email.attachments.length > 0 && (
              <MdAttachFile className={styles.attachIcon} />
            )}
          </div>
          <div className={styles.preview}>
            {email.text.slice(0, 100)}
            {email.text.length > 100 && '...'}
          </div>
        </div>
      ))}
    </div>
  );
}


