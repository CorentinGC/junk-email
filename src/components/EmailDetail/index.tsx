/**
 * Email detail view component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { MdArrowBack, MdAttachFile } from 'react-icons/md';
import sanitizeHtml from 'sanitize-html';
import type { Email } from '#types/email';
import styles from './EmailDetail.module.scss';

interface Props {
  email: Email;
  onBack: () => void;
}

/**
 * Format date
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export default function EmailDetail({ email, onBack }: Props) {
  const sanitized = email.html
    ? sanitizeHtml(email.html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height'],
        },
      })
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <MdArrowBack /> Back
        </button>
      </div>

      <div className={styles.card}>
        <h1 className={styles.subject}>{email.subject}</h1>

        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <span className={styles.label}>From:</span>
            <span className={styles.value}>
              {email.from.name ? `${email.from.name} <${email.from.address}>` : email.from.address}
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.label}>To:</span>
            <span className={styles.value}>
              {email.to.map((t) => t.address).join(', ')}
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.label}>Date:</span>
            <span className={styles.value}>{formatDate(email.receivedAt)}</span>
          </div>
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <div className={styles.attachments}>
            <MdAttachFile /> {email.attachments.length} attachment(s)
          </div>
        )}

        <div className={styles.body}>
          {sanitized ? (
            <div dangerouslySetInnerHTML={{ __html: sanitized }} />
          ) : (
            <pre className={styles.text}>{email.text}</pre>
          )}
        </div>
      </div>
    </div>
  );
}


