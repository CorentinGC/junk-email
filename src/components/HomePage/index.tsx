/**
 * Home page component
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdLogout, MdEmail, MdCasino } from 'react-icons/md';
import AddressHistory from '#components/AddressHistory';
import styles from './HomePage.module.scss';

export default function HomePage() {
  const router = useRouter();
  const [customAddress, setCustomAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate local part of email
   * @param {string} value - Local part to validate
   * @returns {boolean} True if valid
   */
  const isValidInput = (value: string): boolean => {
    if (!value || value.length === 0) return false;
    if (value.startsWith('.') || value.endsWith('.')) return false;
    return /^[a-z0-9._-]+$/i.test(value);
  };

  /**
   * Create address (custom or random) and navigate to inbox
   * @param {string|null} address - Custom address or null for random
   */
  const createAndNavigate = async (address: string | null) => {
    setLoading(true);
    setError(null);

    if (address && !isValidInput(address)) {
      setError('Caractères invalides. Utilisez uniquement: lettres, chiffres, .-_');
      setLoading(false);
      return;
    }

    try {
      const body = address ? { customAddress: address } : undefined;
      
      const response = await fetch('/api/address', { 
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Échec de création');
      }

      const username = result.data.address.split('@')[0];
      router.push(`/inbox/${encodeURIComponent(username)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
    }
  };

  /**
   * Handle custom address creation
   */
  const handleCreateCustom = () => {
    createAndNavigate(customAddress.trim());
  };

  /**
   * Handle random address generation
   */
  const handleCreateRandom = () => {
    createAndNavigate(null);
  };

  /**
   * Navigate to inbox page when address is selected from history
   * @param {string} address - Email address
   */
  const handleSelectAddress = (address: string) => {
    const username = address.split('@')[0];
    router.push(`/inbox/${encodeURIComponent(username)}`);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Junk Mail</h1>
          <p className={styles.subtitle}>Adresses jetables pour tests & confidentialité</p>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Déconnexion"
        >
          <MdLogout />
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.mainContent}>
          <div className={styles.createBox}>
            <MdEmail className={styles.icon} />
            <h2 className={styles.createTitle}>Créer une adresse email</h2>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.input}
                placeholder="nom-adresse (lettres, chiffres, .-_ uniquement)"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && customAddress.trim() && handleCreateCustom()}
                disabled={loading}
              />
              <button
                className={styles.createBtn}
                onClick={handleCreateCustom}
                disabled={loading || !customAddress.trim()}
                title="Créer cette adresse"
              >
                {loading ? '...' : 'Créer'}
              </button>
            </div>

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <button
              className={styles.randomBtn}
              onClick={handleCreateRandom}
              disabled={loading}
            >
              <MdCasino />
              Générer une adresse aléatoire
            </button>

            {error && (
              <div className={styles.error}>{error}</div>
            )}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <AddressHistory onSelectAddress={handleSelectAddress} />
        </aside>
      </main>

      <footer className={styles.footer}>
        <p>Adresses permanentes - Emails expirés automatiquement</p>
      </footer>
    </div>
  );
}


