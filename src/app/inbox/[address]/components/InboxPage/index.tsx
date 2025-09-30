/**
 * Inbox page component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdSettings as MdSettingsIcon } from 'react-icons/md';
import InboxViewer from '#components/InboxViewer';
import Settings from '#components/Settings';
import type { InboxAddress } from '#types/email';
import styles from './InboxPage.module.scss';

interface Props {
  address: string;
}

export default function InboxPage({ address }: Props) {
  const router = useRouter();
  const [inbox, setInbox] = useState<InboxAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  /**
   * Fetch inbox data from API
   */
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/inbox/${encodeURIComponent(address)}`);
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
  }, [address]);

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Loading inbox...</div>
      </div>
    );
  }

  if (error || !inbox) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Junk Mail</h1>
        </header>
        <div className={styles.error}>
          <h2>Inbox not found</h2>
          <p>{error || 'This inbox does not exist or has expired.'}</p>
          <button onClick={handleBack} className={styles.backButton}>
            <MdArrowBack /> Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack} title="Back to home">
            <MdArrowBack />
          </button>
          <div>
            <h1 className={styles.title}>Junk Mail</h1>
            <p className={styles.subtitle}>Inbox for {inbox.address}</p>
          </div>
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
        <InboxViewer inbox={inbox} onReset={handleBack} showShareLink />
      </main>

      <footer className={styles.footer}>
        <p>Emails auto-delete based on retention settings</p>
      </footer>
    </div>
  );
}

