/**
 * Home page component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdSettings as MdSettingsIcon } from 'react-icons/md';
import AddressGenerator from '#components/AddressGenerator';
import AddressHistory from '#components/AddressHistory';
import Settings from '#components/Settings';
import type { InboxAddress } from '#types/email';
import styles from './HomePage.module.scss';

export default function HomePage() {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  /**
   * Navigate to inbox page when address is generated
   * @param {InboxAddress} inbox - Generated inbox address
   */
  const handleGenerate = (inbox: InboxAddress) => {
    const username = inbox.address.split('@')[0];
    router.push(`/inbox/${encodeURIComponent(username)}`);
  };

  /**
   * Navigate to inbox page when address is selected from history
   * @param {string} address - Email address
   */
  const handleSelectAddress = (address: string) => {
    const username = address.split('@')[0];
    router.push(`/inbox/${encodeURIComponent(username)}`);
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
          <AddressGenerator onGenerate={handleGenerate} />
        </div>

        <aside className={styles.sidebar}>
          <AddressHistory onSelectAddress={handleSelectAddress} />
        </aside>
      </main>

      <footer className={styles.footer}>
        <p>Emails auto-delete based on retention settings</p>
      </footer>
    </div>
  );
}


