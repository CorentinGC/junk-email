/**
 * Home page component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState } from 'react';
import { MdSettings as MdSettingsIcon } from 'react-icons/md';
import AddressGenerator from '#components/AddressGenerator';
import InboxViewer from '#components/InboxViewer';
import AddressHistory from '#components/AddressHistory';
import Settings from '#components/Settings';
import { getInboxAddress } from '#lib/emailStorage';
import type { InboxAddress } from '#types/email';
import styles from './HomePage.module.scss';

export default function HomePage() {
  const [currentInbox, setCurrentInbox] = useState<InboxAddress | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  /**
   * Load existing address from history
   */
  const handleSelectAddress = async (address: string) => {
    try {
      const response = await fetch(`/api/inbox/${encodeURIComponent(address)}`);
      const result = await response.json();

      if (result.success && result.data.inbox) {
        setCurrentInbox(result.data.inbox);
      }
    } catch (err) {
      console.error('Failed to load address:', err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Junk Mail</h1>
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
        <div className={styles.mainContent}>
          {!currentInbox ? (
            <AddressGenerator onGenerate={setCurrentInbox} />
          ) : (
            <InboxViewer inbox={currentInbox} onReset={() => setCurrentInbox(null)} />
          )}
        </div>

        {!currentInbox && (
          <aside className={styles.sidebar}>
            <AddressHistory onSelectAddress={handleSelectAddress} />
          </aside>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Emails auto-delete based on retention settings</p>
      </footer>
    </div>
  );
}


