/**
 * Email detail view component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { MdArrowBack, MdAttachFile, MdDownload, MdImage } from 'react-icons/md';
import sanitizeHtml from 'sanitize-html';
import type { Email } from '#types/email';
import styles from './EmailDetail.module.scss';

interface Props {
  email: Email;
  onBack: () => void;
}

/**
 * Format date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if attachment is an image
 * @param {string} contentType - MIME type
 * @returns {boolean} True if image
 */
function isImage(contentType: string): boolean {
  return contentType.startsWith('image/');
}

export default function EmailDetail({ email, onBack }: Props) {
  const sanitized = email.html
    ? sanitizeHtml(email.html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height', 'style'],
          '*': ['style', 'class'],
        },
        allowedStyles: {
          '*': {
            color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb/, /^rgba/],
            'text-align': [/^left$/, /^right$/, /^center$/],
            'font-size': [/^\d+(?:px|em|rem|%)$/],
            'background-color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb/, /^rgba/],
            'padding': [/^\d+(?:px|em|rem|%)$/],
            'margin': [/^\d+(?:px|em|rem|%)$/],
            'width': [/^\d+(?:px|%)$/],
            'max-width': [/^\d+(?:px|%)$/],
          },
        },
      })
    : null;

  /**
   * Download attachment
   * @param {string} filename - Filename
   */
  const downloadAttachment = (filename: string) => {
    const url = `/api/email/${email.id}/attachment/${encodeURIComponent(filename)}`;
    window.open(url, '_blank');
  };

  const imageAttachments = email.attachments?.filter(att => isImage(att.contentType));

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
          <div className={styles.attachmentsSection}>
            <div className={styles.attachmentsHeader}>
              <MdAttachFile /> {email.attachments.length} pièce(s) jointe(s)
            </div>
            <div className={styles.attachmentsList}>
              {email.attachments.map((att, idx) => (
                <button
                  key={idx}
                  className={styles.attachmentItem}
                  onClick={() => downloadAttachment(att.filename)}
                  title={`Télécharger ${att.filename}`}
                >
                  {isImage(att.contentType) ? <MdImage /> : <MdAttachFile />}
                  <span className={styles.attachmentName}>{att.filename}</span>
                  <span className={styles.attachmentSize}>{formatSize(att.size)}</span>
                  <MdDownload className={styles.downloadIcon} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.body}>
          {sanitized ? (
            <div 
              className={styles.htmlContent}
              dangerouslySetInnerHTML={{ __html: sanitized }} 
            />
          ) : (
            <pre className={styles.text}>{email.text}</pre>
          )}
        </div>

        {imageAttachments && imageAttachments.length > 0 && (
          <div className={styles.imagesSection}>
            <h3>Images</h3>
            <div className={styles.imagesGrid}>
              {imageAttachments.map((att, idx) => (
                <div key={idx} className={styles.imageWrapper}>
                  <img
                    src={`/api/email/${email.id}/attachment/${encodeURIComponent(att.filename)}`}
                    alt={att.filename}
                    className={styles.image}
                    loading="lazy"
                  />
                  <div className={styles.imageCaption}>
                    {att.filename} ({formatSize(att.size)})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


