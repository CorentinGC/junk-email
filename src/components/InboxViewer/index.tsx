/**
 * Inbox viewer component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState, useEffect } from 'react';
import { MdRefresh, MdContentCopy, MdArrowBack, MdLink, MdDeleteSweep } from 'react-icons/md';
import EmailList from '#components/EmailList';
import EmailDetail from '#components/EmailDetail';
import type { InboxAddress, Email } from '#types/email';
import styles from './InboxViewer.module.scss';

interface Props {
  inbox: InboxAddress;
  onReset: () => void;
  showShareLink?: boolean;
  username?: string;
}

export default function InboxViewer({ inbox, onReset, showShareLink = false, username }: Props) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

  /**
   * Copy inbox direct link to clipboard (username only in URL)
   */
  const copyInboxLink = async () => {
    try {
      const usernameOnly = username || inbox.address.split('@')[0];
      const url = `${window.location.origin}/inbox/${encodeURIComponent(usernameOnly)}`;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  /**
   * Delete all emails from inbox
   */
  const handleClearInbox = async () => {
    if (!confirm(`Supprimer tous les ${emails.length} email(s) de cette inbox ?`)) {
      return;
    }

    setLoading(true);
    try {
      const usernameOnly = username || inbox.address.split('@')[0];
      const response = await fetch(`/api/inbox/${encodeURIComponent(usernameOnly)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setEmails([]);
        setSelectedEmail(null);
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Failed to clear inbox:', err);
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete single email
   * @param {string} emailId - Email ID to delete
   */
  const handleDeleteEmail = async (emailId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/email/${encodeURIComponent(emailId)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setEmails(prev => prev.filter(e => e.id !== emailId));
        if (selectedEmail?.id === emailId) {
          setSelectedEmail(null);
        }
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Failed to delete email:', err);
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
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
          {showShareLink && (
            <button
              className={styles.linkButton}
              onClick={copyInboxLink}
              title="Copy inbox link"
            >
              <MdLink />
            </button>
          )}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.clearButton}
            onClick={handleClearInbox}
            disabled={loading || emails.length === 0}
            title="Vider l'inbox"
          >
            <MdDeleteSweep />
          </button>
          <button
            className={styles.refreshButton}
            onClick={fetchEmails}
            disabled={loading}
            title="Refresh"
          >
            <MdRefresh className={loading ? styles.spinning : ''} />
          </button>
        </div>
      </div>

      {copied && <div className={styles.copiedNotif}>Address copied!</div>}
      {linkCopied && <div className={styles.copiedNotif}>Inbox link copied!</div>}

      <EmailList
        emails={emails}
        loading={loading}
        onSelect={setSelectedEmail}
        onDelete={handleDeleteEmail}
      />
    </div>
  );
}


