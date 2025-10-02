/**
 * Inbox page component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdSettings as MdSettingsIcon } from 'react-icons/md';
import InboxViewer from '#components/InboxViewer';
import AddressHistory from '#components/AddressHistory';
import Settings from '#components/Settings';
import type { InboxAddress } from '#types/email';
import styles from './InboxPage.module.scss';

interface Props {
  username: string;
}

export default function InboxPage({ username }: Props) {
  const router = useRouter();
  const [inbox, setInbox] = useState<InboxAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  /**
   * Fetch inbox data from API using username
   * Backend will reconstruct full email with SMTP_DOMAIN
   */
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/inbox/${encodeURIComponent(username)}`);
        const result = await response.json();

        if (result.success && result.data.inbox) {
          setInbox(result.data.inbox);
        } else {
          setError(result.error || 'Inbox not found');
        }
      } catch (err) {
        console.error('Failed to load inbox:', err);
        setError('Failed to load inbox');
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [username]);

  const handleBack = () => {
    router.push('/');
  };

  /**
   * Navigate to another inbox from history
   * @param {string} address - Full email address
   */
  const handleSelectAddress = (address: string) => {
    const usernameOnly = address.split('@')[0];
    router.push(`/inbox/${encodeURIComponent(usernameOnly)}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title} onClick={handleBack} title="Go to Home">
            Junk Mail
          </h1>
          <p className={styles.subtitle}>Disposable email for testing & privacy</p>
        </div>
        <button
          className={styles.settingsBtn}
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <MdSettingsIcon />
        </button>
      </header>

      {showSettings && (
        <div className={styles.settingsPanel}>
          <Settings />
        </div>
      )}

      <main className={styles.main}>
        {loading ? (
          <div className={styles.mainContent}>
            <div className={styles.loader}>Loading inbox...</div>
          </div>
        ) : error || !inbox ? (
          <div className={styles.mainContent}>
            <div className={styles.error}>
              <h2>Inbox not found</h2>
              <p>{error || 'This inbox does not exist or has expired.'}</p>
              <button onClick={handleBack} className={styles.backButton}>
                Go to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.mainContent}>
              <InboxViewer inbox={inbox} onReset={handleBack} showShareLink username={username} />
            </div>
            <aside className={styles.sidebar}>
              <AddressHistory onSelectAddress={handleSelectAddress} />
            </aside>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Emails auto-delete based on retention settings</p>
      </footer>
    </div>
  );
}

