/**
 * Inbox viewer component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState, useEffect } from 'react';
import { MdRefresh, MdContentCopy, MdArrowBack } from 'react-icons/md';
import EmailList from '#components/EmailList';
import EmailDetail from '#components/EmailDetail';
import type { InboxAddress, Email } from '#types/email';
import styles from './InboxViewer.module.scss';

interface Props {
  inbox: InboxAddress;
  onReset: () => void;
}

export default function InboxViewer({ inbox, onReset }: Props) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Fetch emails from API
   */
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inbox/${encodeURIComponent(inbox.address)}`);
      const result = await response.json();

      if (result.success) {
        setEmails(result.data.emails);
      }
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy email address to clipboard
   */
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(inbox.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [inbox.address]);

  if (selectedEmail) {
    return (
      <EmailDetail
        email={selectedEmail}
        onBack={() => setSelectedEmail(null)}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onReset}>
          <MdArrowBack />
        </button>
        <div className={styles.addressBox}>
          <span className={styles.address}>{inbox.address}</span>
          <button
            className={styles.copyButton}
            onClick={copyAddress}
            title="Copy address"
          >
            <MdContentCopy />
          </button>
        </div>
        <button
          className={styles.refreshButton}
          onClick={fetchEmails}
          disabled={loading}
          title="Refresh"
        >
          <MdRefresh className={loading ? styles.spinning : ''} />
        </button>
      </div>

      {copied && <div className={styles.copiedNotif}>Address copied!</div>}

      <EmailList
        emails={emails}
        loading={loading}
        onSelect={setSelectedEmail}
      />
    </div>
  );
}


